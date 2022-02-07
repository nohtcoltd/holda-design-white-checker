#![feature(test)]
use wasm_bindgen::prelude::*;
mod checker;
mod util;

#[wasm_bindgen]
pub fn check(path: &str, resolution: u16, outpath: &str) {
    let original = image::open(path).unwrap();
    let img2 = checker::check(&original);
    img2.save(outpath).unwrap();
}
