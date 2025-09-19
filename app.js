document.addEventListener("DOMContentLoaded", () => {
  // 로그인 처리
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      sessionStorage.setItem("studentId", document.getElementById("studentId").value);
      window.location.href = "main.html";
    });
  }

  // 팝업 처리
  const popup = document.getElementById("noticePopup");
  const closeBtn = document.getElementById("popupCloseBtn");
  if (popup && closeBtn) {
    closeBtn.addEventListener("click", () => popup.style.display = "none");
  }

  // 시계
  const clock = document.getElementById("clock");
  let currentTime = new Date(2025, 8, 19, 8, 54, 0);
  function updateClock() {
    if (!clock) return;
    const h = String(currentTime.getHours()).padStart(2, "0");
    const m = String(currentTime.getMinutes()).padStart(2, "0");
    const s = String(currentTime.getSeconds()).padStart(2, "0");
    clock.textContent = `현재 시간: ${h}:${m}:${s}`;
    currentTime.setSeconds(currentTime.getSeconds() + 1);
  }
  setInterval(updateClock, 1000);
  updateClock();

  const jumpBtn = document.getElementById("jumpBtn");
  if (jumpBtn) jumpBtn.addEventListener("click", () => currentTime.setHours(8, 59, 0));
  const jumpBtn9 = document.getElementById("jumpBtn9");
  if (jumpBtn9) jumpBtn9.addEventListener("click", () => currentTime.setHours(9, 0, 0));

  // 9시 제한
  const sugangLink = document.getElementById("sugangLink");
  if (sugangLink) {
    sugangLink.addEventListener("click", (e) => {
      if (currentTime.getHours() < 9) {
        e.preventDefault();
        alert("아직 수강신청 기간이 아닙니다.");
      }
    });
  }

  // === 수강신청 기능 ===
  const courseTable = document.getElementById("courseTable");
  const myCourses = document.getElementById("myCourses");
  const timetable = document.getElementById("timetable");
  const loadingPopup = document.getElementById("loadingPopup");

  let applyCount = 0; // 신청 횟수 카운트

  if (courseTable && myCourses && timetable) {
    courseTable.addEventListener("click", (e) => {
      if (e.target.classList.contains("apply-btn")) {
        const row = e.target.closest("tr");
        const cells = row.querySelectorAll("td");
        const code = cells[1].textContent;
        const name = cells[2].textContent;
        const prof = cells[3].textContent;
        const credit = cells[4].textContent;
        const time = cells[6].textContent;

        // 이미 신청했는지 확인
        if ([...myCourses.rows].some(r => r.cells[0] && r.cells[0].textContent === code)) {
          alert("이미 신청한 과목입니다.");
          return;
        }

        applyCount++;

        // 첫 2번은 즉시 성공
        if (applyCount <= 2) {
          addCourseToMyList(code, name, prof, credit, time);
          addToTimetable(time, name);
          alert("✅ 수강신청 성공!");
          return;
        }

        // 이후부터는 로딩팝업 + 랜덤 성공/실패
        if (loadingPopup) loadingPopup.style.display = "flex";

        const delay = Math.random() * 1000 + 2000; // 2~3초
        setTimeout(() => {
          if (loadingPopup) loadingPopup.style.display = "none";

          if (Math.random() < 0.7) {
            addCourseToMyList(code, name, prof, credit, time);
            addToTimetable(time, name);
            alert("✅ 수강신청 성공!");
          } else {
            alert("❌ 수강신청 실패! 다시 시도하세요.");
          }
        }, delay);
      }
    });
  }

  // === 함수들 ===
  function addCourseToMyList(code, name, prof, credit, time) {
    const newRow = myCourses.insertRow();
    newRow.insertCell(0).textContent = code;
    newRow.insertCell(1).textContent = name;
    newRow.insertCell(2).textContent = prof;
    newRow.insertCell(3).textContent = credit;
    newRow.insertCell(4).textContent = time;

    const removeCell = newRow.insertCell(5);
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "삭제";
    removeBtn.addEventListener("click", () => {
      myCourses.deleteRow(newRow.rowIndex);
      removeFromTimetable(time, name);
    });
    removeCell.appendChild(removeBtn);
  }

  function addToTimetable(time, name) {
    const dayMap = { "월": 1, "화": 2, "수": 3, "목": 4, "금": 5 };
    const day = time.charAt(0);
    const slot = time.slice(1);
    const colIndex = dayMap[day];
    if (!colIndex) return;

    for (let row of timetable.rows) {
      if (row.cells[0].textContent.startsWith(slot)) {
        row.cells[colIndex].textContent = name;
        row.cells[colIndex].style.background = "#d0ebff";
        break;
      }
    }
  }

  function removeFromTimetable(time, name) {
    const dayMap = { "월": 1, "화": 2, "수": 3, "목": 4, "금": 5 };
    const day = time.charAt(0);
    const slot = time.slice(1);
    const colIndex = dayMap[day];
    if (!colIndex) return;

    for (let row of timetable.rows) {
      if (row.cells[0].textContent.startsWith(slot) && row.cells[colIndex].textContent === name) {
        row.cells[colIndex].textContent = "";
        row.cells[colIndex].style.background = "";
        break;
      }
    }
  }
});
