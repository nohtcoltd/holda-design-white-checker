use image::{GrayImage, ImageBuffer, Luma};

pub fn create_circle(diameter: u32) -> GrayImage {
    let mut out = ImageBuffer::new(diameter, diameter);
    let rad: f32 = (diameter as f32) / 2.0;
    for x in 0..diameter {
        for y in 0..diameter {
            let cx = (x as f32 - rad + 0.5).abs();
            let cy = (y as f32 - rad + 0.5).abs();
            if (cx * cx + cy * cy) as f32 <= rad * rad {
                out.put_pixel(x, y, Luma([255u8]))
            } else {
                out.put_pixel(x, y, Luma([127u8]))
            }
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn create() {
        create_circle(121).save("tests/output/circle.png").unwrap();
    }
}
