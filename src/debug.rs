
pub fn delight_edges(img: &GrayImage) -> RgbImage {
    let edges = get_edges(img);
    let mut out = ImageBuffer::new(img.width(), img.height());
    for (x, y, pixel) in img.enumerate_pixels() {
        out.put_pixel(x, y, pixel.to_rgb())
    }
    for [x, y] in edges {
        out.put_pixel(x, y, Rgb([255, 0, 0]))
    }
    out
}