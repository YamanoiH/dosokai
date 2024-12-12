// キャラクターの初期位置
const initialTopCharacterY = 10; // 上部キャラクターの初期位置 (%)
const initialBottomCharacterY = 90; // 下部キャラクターの初期位置 (%)

let topCharacterY = initialTopCharacterY; // 上部キャラクターの現在位置
let bottomCharacterY = initialBottomCharacterY; // 下部キャラクターの現在位置
let isRunning = false;
let gameInterval;

// キャラクターを動かす関数
function moveCharacters() {
    topCharacterY += 0.5; // 上部キャラクターを下に移動
    bottomCharacterY -= 0.5; // 下部キャラクターを上に移動

    // キャラクターの位置を更新
    const topCharacter = document.getElementById('topCharacter');
    const bottomCharacter = document.getElementById('bottomCharacter');
    topCharacter.style.top = `${topCharacterY}%`;
    bottomCharacter.style.top = `${bottomCharacterY}%`;

    // キャラクターがエリア外に出た場合の処理
    if (topCharacterY > 100 || bottomCharacterY < 0) {
        stopGame();
        setTimeout(() => {
            document.getElementById('result').textContent = '残念！もう一度挑戦してください。';
            resetGame();
        }, 10000); // 10秒後にリセット
    }
}

// キャラクターとボタンをリセットする関数
function resetGame() {
    const topCharacter = document.getElementById('topCharacter');
    const bottomCharacter = document.getElementById('bottomCharacter');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');

    // ボタンを再度有効にする
    startButton.disabled = false;
    stopButton.disabled = true;

    // キャラクターの位置を初期値にリセット
    topCharacterY = initialTopCharacterY;
    bottomCharacterY = initialBottomCharacterY;
    topCharacter.style.top = `${topCharacterY}%`;
    bottomCharacter.style.top = `${bottomCharacterY}%`;

    // 結果表示をクリア
    document.getElementById('result').textContent = '';
    // 「残念！もう一度挑戦してください。」のテキストを削除
    const gameArea = document.getElementById('gameArea');
    const sadMessage = document.getElementById('sadMessage');
    if (sadMessage) {
        gameArea.removeChild(sadMessage);
    }
}

// ゲームをスタート
function startGame() {
    if (isRunning) return;
    isRunning = true;
    document.getElementById('result').textContent = '';
    document.getElementById('startButton').disabled = true;
    document.getElementById('stopButton').disabled = false;

    // キャラクターを動かす
    gameInterval = setInterval(moveCharacters, 20);
}

// ゲームをストップ
function stopGame() {
    if (!isRunning) return;
    isRunning = false;
    document.getElementById('startButton').disabled = false;
    document.getElementById('stopButton').disabled = true;

    clearInterval(gameInterval);

    // ゲーム結果を判定
    const result = document.getElementById('result');
    if (Math.abs(topCharacterY - bottomCharacterY) < 5) {
        result.textContent = 'クリア！';
        showDecryptForm(); // 復号化フォームを表示
    } else {
        showSadMessage(); // ゲームエリアに「残念！」のテキストを表示
        // ボタンを無効化してリセットまで待機
        document.getElementById('startButton').disabled = true;
        document.getElementById('stopButton').disabled = true;
        setTimeout(resetGame, 2000); // 2秒後にリセット
    }
}

// ゲームエリアに「残念！もう一度挑戦してください。」のテキストを表示する関数
function showSadMessage() {
    const gameArea = document.getElementById('gameArea');

    // メッセージ用の要素を作成
    const sadMessage = document.createElement('div');
    sadMessage.id = 'sadMessage';
    sadMessage.textContent = '残念！もう一度挑戦してください。';
    sadMessage.style.position = 'absolute';
    sadMessage.style.top = '50%';  // ゲームエリアの中央に配置
    sadMessage.style.left = '50%';
    sadMessage.style.transform = 'translate(-50%, -50%)';  // 完全に中央揃え
    sadMessage.style.fontSize = '20px';
    sadMessage.style.fontWeight = 'bold';
    sadMessage.style.color = 'black';
    sadMessage.style.zIndex = '10';  // 上に表示
    gameArea.appendChild(sadMessage);
}

// 復号化フォームを表示する関数
function showDecryptForm() {
    document.getElementById('decryptForm').style.display = 'block'; // ゲームエリアに重ねて表示
}

// 簡易的な復号化処理
document.querySelector('#decryptForm form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const password = document.getElementById('password').value; // 入力されたパスワード
    const message = document.getElementById('message');
    const imageContainer = document.getElementById('imageContainer');
    const decryptedImageElement = document.getElementById('decryptedImage');

    message.textContent = '復号化中です。お待ちください...';
    imageContainer.style.display = 'none';
    decryptedImageElement.src = '';

    try {
        // encryptedImage.txt ファイルを読み込む
        console.log('Fetching encrypted data...');
        const response = await fetch('encryptedImage.txt');
        if (!response.ok) {
            throw new Error(`Failed to fetch encrypted data: ${response.status}`);
        }
        const encryptedData = await response.text();
        console.log('Encrypted data fetched:', encryptedData);

        // 復号化処理
        const decrypted = CryptoJS.AES.decrypt(encryptedData, password);
        const base64Data = decrypted.toString(CryptoJS.enc.Base64);

        if (!base64Data) {
            throw new Error('Decryption failed: Invalid password or corrupted data');
        }

        // Base64データをバイナリに変換
        const binaryData = atob(base64Data);
        const byteArray = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            byteArray[i] = binaryData.charCodeAt(i);
        }

        // Blobに変換して画像を表示
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const imageURL = URL.createObjectURL(blob);


        // 画像を表示
        decryptedImageElement.src = imageURL;
        imageContainer.style.display = 'block';
        message.textContent = '復号化に失敗しました！'; // 成功時のメッセージ
        console.log('Decryption and display successful!');
    } catch (error) {
        message.textContent = '復号に失敗しました。パスワードを確認してください。'; // 失敗時のメッセージ
        console.error('復号エラー:', error);
    }
});

// イベントリスナーを設定
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('stopButton').addEventListener('click', stopGame);