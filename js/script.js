const wrap = document.querySelector('#wrap');
const MEMO_ITEM = 'memo_item'; // 로컬스토리지에 저장될 키값
let localStorageItem; // 로컬스토리지에 저장된 메모 배열
let memoString = []; // 메모 템플릿이 담길 배열
const headerHeight = 16; // 헤더의 높이값
let numberCheck;
let interval;

wrap.oncontextmenu = function (e) {
  e.preventDefault();
  e.stopPropagation();

  const target = e.target;

  if (target === wrap) {
    createMemo(e.clientX, e.clientY);
  } else {
    return false;
  }
};

// 메모 생성 함수
const createMemo = (clientX, clientY, contents, width, height) => {
  let template = `
		<div class="memo" draggable="true" style="top: ${clientY}px; left: ${clientX}px" onclick="frontMemo(this);">
			<div class="header" onmousedown="moveMemo(this)">
				<h1 class="blind">메모장</h1>
				<button class="btn_close" onclick="deleteMemo(this);"><span class="blind">닫기</span></button>
			</div>
			<div class="content">
				<div class="textarea" contenteditable="true" onkeyup="keyupSave()" onclick="resizingMemo(this)" style="width: ${width}px; height: ${
    height - headerHeight
  }px">
					${contents ? contents : '메모 하십시오!'}
				</div>
			</div>
		</div>
	`;

  memoString = [...memoString, template];

  wrap.innerHTML = memoString;
  saveMemo();
};

// 메모 저장 함수
const saveMemo = () => {
  let memoArray = [];
  const memoItems = document.querySelectorAll('.memo');

  memoItems.forEach((memoItem) => {
    memoArray = [
      ...memoArray,
      {
        clientX: memoItem.getBoundingClientRect().left,
        clientY: memoItem.getBoundingClientRect().top,
        contents: memoItem.children[1].children[0].innerText,
        width: memoItem.clientWidth,
        height: memoItem.clientHeight,
      },
    ];

    window.localStorage.setItem(MEMO_ITEM, JSON.stringify(memoArray));
  });
};

// 내용 입력시 자동 저장 함수
const keyupSave = () => {
  numberCheck = 0;
  clearInterval(interval);

  interval = setInterval(() => {
    numberCheck++;
    if (numberCheck === 3) {
      clearInterval(interval);
      saveMemo();
    }
  }, 1000);
};

// 로컬스토리지에서 값 가져오는 함수
const getLocalStorageItem = () => {
  localStorageItem = JSON.parse(localStorage.getItem(MEMO_ITEM));
};

// 메모 삭제 함수
const deleteMemo = (e) => {
  e.parentNode.parentNode.remove();
  saveMemo();
};

// 메모 드래그 앤 드랍 함수
const moveMemo = () => {
  const memoItems = document.querySelectorAll('.memo');

  memoItems.forEach((memoItem) => {
    let active = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    const dragStart = (e) => {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      if (e.target.parentNode === memoItem) {
        active = true;
      }
    };

    const drag = (e) => {
      if (active) {
        e.preventDefault();

        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, memoItem);
      }
    };

    const dragEnd = () => {
      initialX = currentX;
      initialY = currentY;

      active = false;
      saveMemo();
    };

    memoItem.addEventListener('mousedown', dragStart);
    memoItem.addEventListener('mouseup', dragEnd);
    memoItem.addEventListener('mousemove', drag);
  });

  const setTranslate = (xPos, yPos, el) => {
    el.style.transform = 'translate3d(' + xPos + 'px, ' + yPos + 'px, 0)';
  };
};

// 메모 리사이징 함수
const observer = new ResizeObserver((entries, observer) => {});

const resizingMemo = () => {
  const textareaItems = document.querySelectorAll('.textarea');

  textareaItems.forEach((textarea) => {
    observer.observe(textarea);
    saveMemo();
  });
};

// 메모 클릭시 해당 메모 최상단 노출
const frontMemo = (e) => {
  const memoItems = document.querySelectorAll('.memo');
  memoItems.forEach((memoItem) => {
    memoItem.style.zIndex = 1;

    if (e === memoItem) {
      e.style.zIndex = 10;
    }
  });
};

// 페이지 로드시 로컬 스토리지에 메모가 존재하면 로컬 스토리지의 메모를 그려주고 없다면 새로운 메모를 하나 생성합니다.
window.addEventListener('load', function () {
  getLocalStorageItem();

  if (localStorageItem) {
    localStorageItem.map((item) => {
      createMemo(item.clientX, item.clientY, item.contents, item.width, item.height);
    });
  } else {
    createMemo(100, 200);
  }
});
