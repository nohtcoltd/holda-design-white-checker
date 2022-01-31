#![feature(test)]

extern crate image;
extern crate image_base64;
extern crate imageproc;
extern crate test;

use wasm::hoge::check;

#[bench]
fn temp2(b: &mut test::Bencher) {
    let path = "../../tests/fixtures/demo/white.png";
    let original = image::open(path).unwrap();
    b.iter(|| {
        return check(&original); //.save("lumin.png").unwrap();
    });
}
