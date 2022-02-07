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
        .find(|(x, y, Luma([data]))| *data == color)
        .and_then(|(x, y, _)| Some([x, y]))
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
        top_left,
        left,
        bottom_left,
        top_right,
        right,
        bottom_right,
        top,
        bottom,
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

pub fn check(original: &DynamicImage) -> RgbImage {
    let diameter = 10;
    let rad = (diameter / 2) as u32;
    let img2 = binarize(original);
    let edges = get_edges(&img2);
    let circle = create_circle(diameter);
    let mut clone: RgbImage = img2.clone().convert();
    for [x, y] in edges {
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
}

fn get_island(mut image: GrayImage) -> GrayImage {
    let (width, height) = image.dimensions();
    let pixel = Luma([127]);
    let mut newImage = ImageBuffer::from_pixel(width + 2, height + 2, Luma([255]));

    for i in 0..width + 2 {
        newImage.put_pixel(i, 0, pixel);
        newImage.put_pixel(i, height + 1, pixel);
    }
    for i in 0..height + 2 {
        newImage.put_pixel(0, i, pixel);
        newImage.put_pixel(width + 1, i, pixel);
    }
    for (x, y, pixel) in image.enumerate_pixels() {
        newImage.put_pixel(x + 1, y + 1, *pixel)
    }

    fill(&mut newImage, Luma([0]), 0, 0);
    fill(&mut newImage, Luma([255]), 0, 0);
    return image::imageops::crop(&mut newImage, 1, 1, width, height).to_image();
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
    let threshold = (255.0 * 0.3) as u8;

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
        let path = "../../tests/fixtures/demo/5-white.png";
        let original = image::open(path).unwrap();
        check(&original).save("lumin.png").unwrap();

        assert_eq!(1, 1);
    }
}
