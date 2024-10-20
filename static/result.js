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




// 篩選條件按鈕

document.getElementById('filter-toggle-btn').addEventListener('click', function() {
    const filterBox = document.getElementById('filter-box');
    if (filterBox.classList.contains('hidden')) {
      filterBox.classList.remove('hidden');
      filterBox.classList.add('visible');
      this.textContent = '隱藏篩選框';  // 按鈕文字改為隱藏
    } else {
      filterBox.classList.remove('visible');
      filterBox.classList.add('hidden');
      this.textContent = '顯示篩選框';  // 按鈕文字改為顯示
    }
  });

  // 顯示選擇月份
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


