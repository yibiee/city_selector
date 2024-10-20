// 區域:全選功能實現
function toggleAllContinents(selectAllCheckbox) {
    const continentCheckboxes = document.querySelectorAll('input[name="continent"]');
    
    // 如果點選了全選，選中所有區域
    if (selectAllCheckbox.checked) {
        continentCheckboxes.forEach(checkbox => checkbox.checked = true);
    } else {
        // 如果取消全選，取消所有區域選擇
        continentCheckboxes.forEach(checkbox => checkbox.checked = false);
    }
}

// 確保不能單獨選全選框
document.querySelectorAll('input[name="continent"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (!this.checked) {
            document.getElementById('select-all').checked = false;
        }
    });
});
// 控制景點分類選項，最多只能選擇兩個
function toggleSelection(element) {
    element.classList.toggle('selected');
    
    const selectedOptions = document.querySelectorAll('.category-option.selected');
    if (selectedOptions.length > 2) {
        element.classList.remove('selected');
        alert('最多只能選擇兩個分類');
    }
    // 更新隱藏的輸入框
    const selectedCategories = document.querySelectorAll('.category-option.selected');
    let selectedValues = [];

    selectedCategories.forEach(function(category) {
        selectedValues.push(category.innerText.trim());  // 獲取選中分類的名稱
    });

    // 將選中的分類存入隱藏的輸入框
    document.getElementById('selectedCategoriesInput').value = selectedValues.join(',');
}

function showMonthSelect() {
    // 當用戶選擇了溫度後，顯示月份選項
    var temperature = document.getElementById('temperature').value;
    var monthContainer = document.getElementById('month-container');
    
    if (temperature !== "") {
        monthContainer.style.display = "block"; // 顯示月份下拉選單
    }
}


function toggleMonthRequirement() {
    var temperature = document.getElementById('temperature').value;
    var monthContainer = document.getElementById('month-container');
    var monthSelect = document.getElementById('month');
    
    if (temperature === "不限" || temperature === "") {
        monthContainer.style.display = "none"; // 隱藏月份選擇
        monthSelect.removeAttribute('required'); // 月份不必填
    } else {
        monthContainer.style.display = "block"; // 顯示月份選擇
        monthSelect.setAttribute('required', 'required'); // 月份設置為必填
    }
}



// 顯示或隱藏篩選框
function toggleFilterBox() {
    const filterBox = document.querySelector('.filter-box');
    if (filterBox.style.display === 'none' || filterBox.style.display === '') {
      filterBox.style.display = 'block';
    } else {
      filterBox.style.display = 'none';
    }
  }
// 頁面加載時自動打開篩選條件框
window.onload = function() {
   toggleFilterBox();
};


// =========================================

function submitFilters(event) {
    event.preventDefault();  // 阻止表單的默認提交行為

    // 獲取篩選的洲選項
    const asia = document.getElementById('asia').checked;
    const europe = document.getElementById('europe').checked;
    const africa = document.getElementById('africa').checked;
    const northAmerica = document.getElementById('north-america').checked;
    const southAmerica = document.getElementById('south-america').checked;
    const oceania = document.getElementById('oceania').checked;

    // 建立 URL 查詢參數
    const params = new URLSearchParams();
    if (asia) params.append('continent', '亞洲');
    if (europe) params.append('歐洲');
    if (africa) params.append('非洲');
    if (northAmerica) params.append('北美洲');
    if (southAmerica) params.append('南美洲');
    if (oceania) params.append('大洋洲');

    // 導向結果頁面，並將篩選條件附加到 URL 中
    window.location.href = '/result.html?' + params.toString();
  }
