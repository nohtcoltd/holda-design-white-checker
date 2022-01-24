# designs-divider
デザイン分割アプリ

## 実行ファイルについて
実行にnode.jsが必要ですが、製作等、node.jsをインストールしていない環境での実行が想定されるため、nexeでnode.jsごと.exeファイルにラップして利用することが想定されています。  
ビルド、パッケージ、リリースとも微妙に違うのでこのexeファイル(macの場合は拡張子は無いですが)を「実行ファイル」と呼び、tsファイルをトランスパイル、bundleする「ビルド(ファイル)」と分けて呼ぶことにします。

## 実行ファイル生成に必要なもの(windows 10)
node.js  
visual studio  
windows 10 SDK 10.0.20348 (visual studioインストール時にインストール可能)  

## 推奨実行ファイル生成環境
Node16.13.1以上  
nodeをビルドするので基本初回ビルドは一時間強くらいかかります。  
基本使用するOSでビルドを行ってください。  

## ビルド方法
yarn build

## 実行ファイル生成方法(mac)
yarn dist
で  
build/内に生成される。  

## ビルド方法(win)
https://github.com/nexe/nexe#windows の通りにPowerShellでコマンドを実行(npm config set msvs_version 2019の「2019」はVisualStudioのバージョン)。  
yarn dist:win  
を実行。  
必要なwindows SDKがない場合「Windows SDK<version名>がありません」という旨のエラーメッセージが表示されるので、　　
VisualStudioを開き　　
メニューバー→ツール→ツールと機能を取得を選択し、VisualStudio Installerを開く。　　
C++によるデスクトップ開発を選択し右側のペイン「インストールの詳細」から該当するwindows SDKを選択し、インストールを行う。　　
インストール完了後、再度　　
yarn dist:win　　
を実行すると　　
build/内に生成される。　　

## 注意
実行ファイルの他にnode_modulesが生成されますが、これは実行のために必要なので必ず実行ファイルとこのnode_modulesは同一のディレクトリに置いてください。

## 使い方
[win]　　
```
build/design-divider.exe <inputDir> <outputDir> <width> <height> (<debugDir>)  
```
[mac]　　
```
build/design-divider <inputDir> <outputDir> <width> <height> (<debugDir>)　　
```

### inputDir　　
入力ディレクトリ。一つのsvgと複数のpngのみを含むディレクトリにしてください。　　
### outputDir　　
出力ディレクトリ。実行前にこのディレクトリ内にあったファイルは実行後全て削除されます。　　
### width
svgの幅 （例： 55pt）　　

### height
svgの幅 （例： 50mm）　　

### debugDir
デバッグ用出力ディレクトリ。実行前にこのディレクトリ内にあったファイルは実行後全て削除されます。　　
