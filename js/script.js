const wrap = document.querySelector('#wrap');
const MEMO_ITEM = 'memo_item';
let localStorageItem;
let memoString = [];

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
// 메모를 만들어서 memoString 배열에 담고 wrap 안에 넣어준다.
// 그런다음 메모 저장함수를 실행시켜 로컬스토리지에 담는다.
const createMemo = (clientX, clientY, contents, width, height) => {
  let template = `
		<div class="memo" draggable="true" style="top: ${clientY}px; left: ${clientX}px" onclick="frontMemo(this);">
			<div class="header" onmousedown="moveMemo(this)">
				<h1 class="blind">메모장</h1>
				<button class="btn_close" onclick="deleteMemo(this);"><span class="blind">닫기</span></button>
			</div>
			<div class="content">
				<div class="textarea" contenteditable="true" onkeyup="timeoutSave(this)" onclick="resizingMemo(this)" style="width: ${
          width - 20
        }px; height: ${height - 35}px">
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
// 화면의 memo를 전부 가져와서
// memoArray에 담은 후 로컬스토리지에 저장
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
  console.log('saveMemo');
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
      initialX = e.clientX - xOffset; // 클릭했을 때 x좌표
      initialY = e.clientY - yOffset;
      if (e.target.parentNode === memoItem) {
        active = true;
      }
    };

    const drag = (e) => {
      if (active) {
        e.preventDefault();

        currentX = e.clientX - initialX; // 클릭했을 때 찍힌 x좌표 - 처음 클릭했을 때 찍힌 x좌표
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
const observer = new ResizeObserver((entries) => {
  for (let entry of entries) {
    const { width, height } = entry.contentRect;
    // console.log('entry', entry);
    // console.log(`:너비: ${width} 높이: ${height}`);
  }
});

const resizingMemo = (e) => {
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

//
const timeoutSave = (e) => {
  const memoItems = document.querySelectorAll('.textarea');
  memoItems.forEach((memoItem) => {
    if (e.innerText === memoItem.innerText) {
      console.log(e.innerText);
      console.log(memoItem.innerText);
    }
  });
  console.log(e.innerText);
  setTimeout(() => {
    saveMemo();
  }, 1000);
};

// 페이지 로드시 로컬 스토리지가 존재하면 로컬 스토리지의 메모를 그려주고
// 없다면 새로운 메모를 하나 생성한다.
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

/*
1. 메모 생성 함수(){
	- html안에 있는 memo태그를 선택해 배열에 담는다.
	- 새로운 메모를 생성 후 배열에 넣어준다.
	- 합쳐진 배열을 화면에 그려준다.
}

2. 드래그 앤 드랍 함수(){
	- html안에 있는 메모함수들을 선택 후 헤더를 드래그앤 드랍할때 위치를 옮겨주는 함수
	- 드래그 앤 드랍할 때 해당 요소에 z-index를 메모들이 있는 배열안의 메모보다 크게 설정
}

3. 메모 삭제 함수(){
	- 클릭 시 해당 메모 삭제 및 배열 업데이트
}

4. 리사이징 함수(){
	- 해당 요소 리사이징 시 배열안의 해당 메모 사이즈 업데이트
}

5. 메모 내용 수정 함수(){
	- 메모 내용 수정 시 메모배열에 해당 메모 업데이트
}

6. localstorage에 저장(){
	생성, 드래그앤드랍, 삭제, 리사이징 시 로컬스토리지 업데이트
}
*/
