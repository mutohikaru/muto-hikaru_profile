document.addEventListener("DOMContentLoaded", () => {
  // 1. 基本の配置（Base）の設定：画面の向きに合わせて切り替わる土台
  const configs = {
    landscape: {
      card1: { x: 27, y: 60, r: -10, z: 1 },
      card2: { x: 25, y: -60, r: 20, z: 2 },
      card3: { x: -25, y: 60, r: 20, z: 3 },
      card4: { x: -27, y: -60, r: -10, z: 4 },
    },
    portrait: {
      card1: { x: 27, y: 70, r: -10, z: 1 },
      card2: { x: 25, y: -70, r: 20, z: 2 },
      card3: { x: -25, y: 70, r: 20, z: 3 },
      card4: { x: -27, y: -70, r: -10, z: 4 },
    },
  };

  // 2. ユーザーが動かした差分（Offset）：ドラッグやホイールで変動し、維持される値
  const userOffsets = {
    card1: { x: 0, y: 0, r: 0, z: 1 },
    card2: { x: 0, y: 0, r: 0, z: 2 },
    card3: { x: 0, y: 0, r: 0, z: 3 },
    card4: { x: 0, y: 0, r: 0, z: 4 },
  };

  let currentMode = "landscape";
  let maxZIndex = 3;
  const cards = document.querySelectorAll(".card");

  // 画面の向きを判定してモードを更新
  const checkLayoutMode = () => {
    // 縦長なら 'portrait'、横長なら 'landscape'
    currentMode = window.innerHeight > window.innerWidth ? "portrait" : "landscape";
    // モードが変わったら全カードを再描画
    cards.forEach((card) => updateCardTransform(card.id, card));
  };

  // 画面への描画処理：「Base」+「Offset」を足し合わせる
  const updateCardTransform = (id, element) => {
    const base = configs[currentMode][id];
    const offset = userOffsets[id];

    // 最終的な座標 = 基本位置 + ユーザーが動かした距離
    const finalX = base.x + offset.x;
    const finalY = base.y + offset.y;
    const finalR = base.r + offset.r;

    element.style.transform = `translate(${finalX}vw, ${finalY}vh) rotate(${finalR}deg)`;
    element.style.zIndex = offset.z; // z-indexはoffset側で管理
  };

  // リサイズ時にレイアウト判定を実行
  window.addEventListener("resize", checkLayoutMode);
  checkLayoutMode(); // 初回読み込み時の初期化

  // 3. マウスイベントの設定
  cards.forEach((card) => {
    let isDragging = false;
    let startMouseX, startMouseY;
    let startOffsetX, startOffsetY; // BaseではなくOffsetを記録する

    // --- クリック ＆ ドラッグ開始 ---
    card.addEventListener("mousedown", (e) => {
      maxZIndex++;
      userOffsets[card.id].z = maxZIndex;
      updateCardTransform(card.id, card);

      isDragging = true;
      startMouseX = e.clientX;
      startMouseY = e.clientY;

      // ドラッグ開始時の「Offset（差分）」を記憶
      startOffsetX = userOffsets[card.id].x;
      startOffsetY = userOffsets[card.id].y;
    });

    // --- ドラッグ中 ---
    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const deltaX_px = e.clientX - startMouseX;
      const deltaY_px = e.clientY - startMouseY;

      const deltaX_vw = (deltaX_px / window.innerWidth) * 100;
      const deltaY_vh = (deltaY_px / window.innerHeight) * 100;

      // 「Offset（差分）」だけを更新する
      userOffsets[card.id].x = startOffsetX + deltaX_vw;
      userOffsets[card.id].y = startOffsetY + deltaY_vh;

      updateCardTransform(card.id, card);
    });

    // --- ドラッグ終了 ---
    window.addEventListener("mouseup", () => {
      if (isDragging) isDragging = false;
    });

    // --- ホイールで回転 ---
    card.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        // 回転の差分を追加
        userOffsets[card.id].r += e.deltaY * 0.05;
        updateCardTransform(card.id, card);
      },
      { passive: false },
    );
  });
});
