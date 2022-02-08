extern crate test;

extern crate image;

use image::buffer::ConvertBuffer;
use image::DynamicImage;
use image::GenericImageView;
use image::GrayImage;
use image::ImageBuffer;
use image::Pixel;
use image::RgbImage;
use image::{Luma, LumaA, Rgb};

use crate::util::create_circle;

fn find(image: &GrayImage, color: u8) -> Option<[u32; 2]> {
    image
        .enumerate_pixels()
        .find(|(_, _, Luma([data]))| *data == color)
        .and_then(|(x, y, _)| Some([x, y]))
}
fn create_rounds(rad: u32) -> Vec<(i32, i32)> {
    let rrad = rad as i32;
    let mut vector: Vec<(i32, i32)> = vec![];
    for i in -rrad..rrad + 1 {
        for j in -rrad..rrad + 1 {
            if !(i == 0 && j == 0) {
                vector.push((i, j));
            }
        }
    }
    vector
}

fn fill<P: Pixel + 'static>(
    image: &mut ImageBuffer<P, Vec<P::Subpixel>>,
    color: P,
    x: u32,
    y: u32,
) {
    let this_color = image.get_pixel(x, y).clone();
    if this_color.channels() == color.channels() {
        return;
    }
    image.put_pixel(x, y, color);
    let (width, height) = image.dimensions();
    let top_left = (x - 1, y - 1);
    let left = (x - 1, y);
    let bottom_left = (x - 1, y + 1);
    let top_right = (x + 1, y - 1);
    let right = (x + 1, y);
    let bottom_right = (x + 1, y + 1);
    let top = (x, y - 1);
    let bottom = (x, y + 1);

    let is_valid = |x: u32, y: u32| x <= width - 1 && y <= height - 1;

    for (x, y) in [
        // top_left,
        left, // bottom_left,
        // top_right,
        right, // bottom_right,
        top, bottom,
    ] {
        if is_valid(x, y) {
            let pixel = image.get_pixel(x, y);
            if pixel.channels() == this_color.channels() {
                fill(image, color, x, y)
            }
        }
    }
}

fn has_river(image: &GrayImage) -> bool {
    let mut clone = image.clone();

    let [x, y] = find(image, 255).unwrap();
    fill(&mut clone, Luma([0]), x, y);
    clone.pixels().any(|Luma([data])| *data == 255)
}

pub fn check(original: &DynamicImage, diameter: u32) -> RgbImage {
    _check(original, diameter * 2)
}

fn _check(original: &DynamicImage, diameter: u32) -> RgbImage {
    let rad = (diameter / 2) as u32;
    let img2 = binarize(original);
    let edges = get_edges(&img2);
    let circle = create_circle(diameter);
    let mut clone: RgbImage = img2.clone().convert();
    for [x, y] in &edges {
        let mut cropped: GrayImage =
            image::imageops::crop_imm(&img2, x - rad, y - rad, diameter, diameter).to_image();

        composite(&mut cropped, &circle, 0, 0);
        if has_river(&cropped) {
            for (dx, dy, Luma([data])) in cropped.enumerate_pixels() {
                if *data == 0 {
                    clone.put_pixel(x + dx - rad, y + dy - rad, Rgb([255, 0, 0]))
                }
            }
        }
        let land = get_island(cropped);
        for (dx, dy, Luma([data])) in land.enumerate_pixels() {
            if *data == 0 {
                clone.put_pixel(x + dx - rad, y + dy - rad, Rgb([255, 0, 0]))
            }
        }
    }
    clone
    // let [x, y] = edges[399].clone();

    // let mut circle_clone = circle.clone();

    // for (x, y, Luma([data])) in circle.enumerate_pixels() {
    //     if *data == 0 {
    //         circle_clone.put_pixel(x, y, Luma([127]));
    //     }
    // }
    // let mut converted: GrayImage = clone.convert();
    // composite(&mut converted, &circle, x - rad, y - rad);
    // converted.convert()
}

fn get_island(image: GrayImage) -> GrayImage {
    let (width, height) = image.dimensions();
    let mut new_image = ImageBuffer::from_pixel(width, height, Luma([255]));

    for (dx, dy, pixel) in image.enumerate_pixels() {
        new_image.put_pixel(dx, dy, *pixel);
    }

    fill(&mut new_image, Luma([0]), 0, 0);
    fill(&mut new_image, Luma([0]), width - 1, 0);
    fill(&mut new_image, Luma([0]), 0, height - 1);
    fill(&mut new_image, Luma([0]), width - 1, height - 1);

    fill(&mut new_image, Luma([255]), 0, 0);
    fill(&mut new_image, Luma([255]), width - 1, 0);
    fill(&mut new_image, Luma([255]), 0, height - 1);
    fill(&mut new_image, Luma([255]), width - 1, height - 1);
    return image::imageops::crop(&mut new_image, 0, 0, width, height).to_image();
}

fn composite(dest: &mut GrayImage, src: &GrayImage, offset_x: u32, offset_y: u32) {
    for (x, y, pixel) in src.enumerate_pixels() {
        let Luma([data]) = *pixel;
        if data != 255 {
            dest.put_pixel(x + offset_x, y + offset_y, *pixel)
        }
    }
}

pub fn binarize(img: &DynamicImage) -> GrayImage {
    let mut out: GrayImage = ImageBuffer::new(img.width(), img.height());
    let original_monochrome = img.to_luma_alpha8();
    let threshold = (255.0 * 0.7) as u8;

    for (x, y, pixel) in original_monochrome.enumerate_pixels() {
        let LumaA([depth, alpha]) = *pixel;
        let color = if depth > threshold || alpha < threshold {
            255u8
        } else {
            0u8
        };
        out.put_pixel(x, y, Luma([color]));
    }
    return out;
}

pub fn get_edges(img: &GrayImage) -> Vec<[u32; 2]> {
    let mut list = Vec::new();

    let (width, height) = img.dimensions();

    let is_valid = |x: u32, y: u32| x <= width - 1 && y <= height - 1;

    for (x, y, pixel) in img.enumerate_pixels() {
        let Luma([depth]) = *pixel;
        if depth > 0 {
            let mut pushed = false;
            let left = [x - 1, y];
            let right = [x + 1, y];
            let top = [x, y - 1];
            let bottom = [x, y + 1];
            for [tx, ty] in [left, right, top, bottom].into_iter() {
                if is_valid(tx, ty) {
                    let Luma([value]) = *img.get_pixel(tx, ty);
                    if value == 0 && !pushed {
                        list.push([x, y]);
                        pushed = true;
                    }
                }
            }
        }
    }
    list
}

#[cfg(test)]
mod tests {
    use crate::checker::check;
    #[test]
    fn range() {
        let mut num = 0;
        for i in 0..5 {
            num = i;
        }
        assert_eq!(num, 4);
    }

    #[test]
    fn temp() {
        let path = "./tests/fixtures/demo/white.png";
        let original = image::open(path).unwrap();
        check(&original, 5).save("lumin.png").unwrap();

        assert_eq!(1, 1);
    }
}
