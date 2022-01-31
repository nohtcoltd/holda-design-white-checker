use wasm;

fn main() {
    let path = "../../tests/fixtures/demo/white.png";
    let original = image::open(path).unwrap();
    let img2 = wasm::hoge::binarize(&original);
    img2.save("test.png").unwrap();
}
