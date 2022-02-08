#![feature(test)]
use wasm_bindgen::prelude::*;
mod checker;
mod util;

#[wasm_bindgen]
pub fn check(path: &str, diameter: u32, outpath: &str) {
    let original = image::open(path).unwrap();
    let img2 = checker::check(&original, diameter);
    img2.save(outpath).unwrap();
}