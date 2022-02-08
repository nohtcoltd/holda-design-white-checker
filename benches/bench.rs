#![feature(test)]

use checker_wasm::check;


extern crate image;
extern crate test;

#[bench]
fn temp2(b: &mut test::Bencher) {
    b.iter(|| {
        return check("../../tests/fixtures/demo/white.png", 5, "./output.png");
    });
}
