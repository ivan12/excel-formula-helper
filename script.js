document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');

        const tabName = tab.getAttribute('data-tab');
        document.getElementById(tabName + '-tab').classList.add('active');
    });
});

let formulaHistory = JSON.parse(localStorage.getItem('formulaHistory')) || [];
updateHistoryDisplay();

function addMappingPair() {
    const container = document.getElementById('mapping-pairs');
    const newPair = document.createElement('div');
    newPair.className = 'mapping-pair';
    newPair.innerHTML = `
        <input type="text" class="mapping-from" placeholder="Original Value">
        <input type="text" class="mapping-to" placeholder="Mapped Value">
        <button class="remove-mapping" onclick="removeMappingPair(this)"><i class="fas fa-trash-alt"></i></button>
    `;
    container.appendChild(newPair);
}

function clearHistory() {
    if (confirm('Are you sure you want to clear the history?')) {
        formulaHistory = [];
        localStorage.removeItem('formulaHistory');
        updateHistoryDisplay();
    } else {
        console.log('History was not cleared.');
    }
}

function clearOutput() {
    document.getElementById('formula-output').textContent =
        'The generated formula will appear here';
}

function copyFormula() {
    const output = document.getElementById('formula-output');
    const formula = output.textContent;

    const textarea = document.createElement('textarea');
    textarea.value = formula;
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        alert('Formula copied to clipboard!');
    } catch (err) {
        alert('Unable to copy formula. Please copy it manually.');
    } finally {
        document.body.removeChild(textarea);
    }
}

function generateBasicFormula() {
    const cell = document.getElementById('basic-cell').value.trim();
    const formulaType = document.getElementById('basic-formula-type').value;
    const range = document.getElementById('basic-range').value.trim();
    const defaultValue = document.getElementById('basic-default').value.trim();

    let formula = '';

    if (!cell) {
        alert('Please enter a cell reference.');
        return;
    }

    if (formulaType !== 'isnumber' && !range) {
        alert('Please enter a range of cells.');
        return;
    }

    switch (formulaType) {
        case 'sum':
            formula = `=SUM(${range})`;
            break;
        case 'average':
            formula = `=AVERAGE(${range})`;
            break;
        case 'count':
            formula = `=COUNT(${range})`;
            break;
        case 'max':
            formula = `=MAX(${range})`;
            break;
        case 'min':
            formula = `=MIN(${range})`;
            break;
        case 'isnumber':
            formula = `=IF(ISNUMBER(${cell}), ${cell}, ${defaultValue || 0})`;
            break;
    }

    updateOutput(formula);
}

function generateMappingFormula() {
    const cell = document.getElementById('mapping-cell').value.trim();
    const mappingType = document.getElementById('mapping-type').value;
    let defaultValue = document.getElementById('mapping-default').value || '""';

    if (!defaultValue.startsWith('"') && !defaultValue.endsWith('"')) {
        defaultValue = `"${defaultValue}"`;
    }

    if (!cell) {
        alert('Please enter a cell reference.');
        return;
    }

    const pairs = [];
    document.querySelectorAll('.mapping-pair').forEach(pair => {
        const from = pair.querySelector('.mapping-from').value.trim();
        const to = pair.querySelector('.mapping-to').value.trim();

        if (from && to) {
            pairs.push({ from, to });
        }
    });

    if (pairs.length === 0) {
        alert('Please add at least one valid mapping pair.');
        return;
    }

    let formula = '=IF(';
    let conditions = [];

    pairs.forEach(pair => {
        let condition = '';
        let fromValue = pair.from;
        let toValue = pair.to;

        switch (mappingType) {
            case 'text-to-number':
                condition = `${cell}="${fromValue}"`;
                conditions.push(`IF(${condition}; ${toValue}; `);
                break;
            case 'number-to-text':
                condition = `${cell}=${fromValue}`;
                conditions.push(`IF(${condition}; "${toValue}"; `);
                break;
            case 'text-to-text':
                condition = `${cell}="${fromValue}"`;
                conditions.push(`IF(${condition}; "${toValue}"; `);
                break;
        }
    });

    let nestedFormula = defaultValue;
    for (let i = conditions.length - 1; i >= 0; i--) {
        nestedFormula = conditions[i] + nestedFormula + ')';
    }

    formula = nestedFormula;

    updateOutput(formula);
}

function generateTextFormula() {
    const cell = document.getElementById('text-cell').value.trim();
    const manipulation = document.getElementById('text-manipulation').value;
    const charCount = document.getElementById('text-char-num').value;
    const startPos = document.getElementById('text-start').value;
    const findText = document.getElementById('text-find').value;
    const replaceText = document.getElementById('text-replace').value;
    const defaultValue = document.getElementById('text-default').value || '0';

    let formula = '';

    if (!cell) {
        alert('Please enter a cell reference.');
        return;
    }

    switch (manipulation) {
        case 'left':
            formula = `=LEFT(${cell},${charCount})`;
            break;
        case 'right':
            formula = `=RIGHT(${cell},${charCount})`;
            break;
        case 'mid':
            formula = `=MID(${cell},${startPos},${charCount})`;
            break;
        case 'len':
            formula = `=LEN(${cell})`;
            break;
        case 'upper':
            formula = `=UPPER(${cell})`;
            break;
        case 'lower':
            formula = `=LOWER(${cell})`;
            break;
        case 'proper':
            formula = `=PROPER(${cell})`;
            break;
        case 'trim':
            formula = `=TRIM(${cell})`;
            break;
        case 'substitute':
            if (!findText || !replaceText) {
                alert('Please enter both search and replacement text.');
                return;
            }
            formula = `=SUBSTITUTE(${cell},"${findText}","${replaceText}")`;
            break;
        case 'value':
            formula = `=IF(ISNUMBER(VALUE(${cell})), VALUE(${cell}), ${defaultValue})`;
            break;
    }

    updateOutput(formula);
}

function removeHistoryItem(index) {
    formulaHistory.splice(index, 1);
    localStorage.setItem('formulaHistory', JSON.stringify(formulaHistory));
    updateHistoryDisplay();
}

function removeMappingPair(button) {
    const pairs = document.querySelectorAll('.mapping-pair');
    if (pairs.length > 1) {
        button.parentElement.remove();
    }
}

function toggleCustomDateFormat() {
    const formatValue = document.getElementById('date-format').value;
    const customContainer = document.getElementById('date-custom-container');

    if (formatValue === 'custom') {
        customContainer.classList.remove('hidden');
    } else {
        customContainer.classList.add('hidden');
    }
}

function toggleDateCalcOptions() {
    const calcType = document.getElementById('date-calc').value;
    const secondCellContainer = document.getElementById('date-second-cell-container');
    const valueContainer = document.getElementById('date-value-container');

    secondCellContainer.classList.add('hidden');
    valueContainer.classList.add('hidden');

    switch (calcType) {
        case 'days-between':
            secondCellContainer.classList.remove('hidden');
            break;
        case 'add-days':
        case 'add-months':
        case 'add-years':
            valueContainer.classList.remove('hidden');
            break;
    }
}

function toggleDateOptions() {
    const formatType = document.getElementById('date-format-type').value;
    const formatContainer = document.getElementById('date-format-container');
    const customContainer = document.getElementById('date-custom-container');
    const extractContainer = document.getElementById('date-extract-container');
    const convertContainer = document.getElementById('date-convert-container');
    const calcContainer = document.getElementById('date-calc-container');
    const secondCellContainer = document.getElementById('date-second-cell-container');
    const valueContainer = document.getElementById('date-value-container');

    formatContainer.classList.add('hidden');
    customContainer.classList.add('hidden');
    extractContainer.classList.add('hidden');
    convertContainer.classList.add('hidden');
    calcContainer.classList.add('hidden');
    secondCellContainer.classList.add('hidden');
    valueContainer.classList.add('hidden');

    switch (formatType) {
        case 'format':
            formatContainer.classList.remove('hidden');
            toggleCustomDateFormat();
            break;
        case 'extract':
            extractContainer.classList.remove('hidden');
            break;
        case 'convert':
            convertContainer.classList.remove('hidden');
            break;
        case 'calc':
            calcContainer.classList.remove('hidden');
            toggleDateCalcOptions();
            break;
    }
}

function toggleTextOptions() {
    const manipulation = document.getElementById('text-manipulation').value;
    const charCountContainer = document.getElementById('text-char-count');
    const startPosContainer = document.getElementById('text-start-pos');
    const findReplaceContainer = document.getElementById('text-find-replace');
    const defaultContainer = document.getElementById('text-default-container');

    charCountContainer.classList.add('hidden');
    startPosContainer.classList.add('hidden');
    findReplaceContainer.classList.add('hidden');
    defaultContainer.classList.add('hidden');

    switch (manipulation) {
        case 'left':
        case 'right':
            charCountContainer.classList.remove('hidden');
            break;
        case 'mid':
            charCountContainer.classList.remove('hidden');
            startPosContainer.classList.remove('hidden');
            break;
        case 'substitute':
            findReplaceContainer.classList.remove('hidden');
            break;
        case 'value':
            defaultContainer.classList.remove('hidden');
            break;
    }
}

function updateBasicFormulaInfo() {
    const formulaType = document.getElementById('basic-formula-type').value;
    const infoElement = document.getElementById('basic-formula-info');
    const rangeContainer = document.getElementById('basic-range-container');
    const defaultContainer = document.getElementById('basic-default-container');

    let info = '';
    switch (formulaType) {
        case 'sum':
            info = 'Sums the values in the specified range.';
            rangeContainer.classList.remove('hidden');
            defaultContainer.classList.add('hidden');
            break;
        case 'average':
            info = 'Calculates the average of the values in the specified range.';
            rangeContainer.classList.remove('hidden');
            defaultContainer.classList.add('hidden');
            break;
        case 'count':
            info = 'Counts the number of cells with values in the specified range.';
            rangeContainer.classList.remove('hidden');
            defaultContainer.classList.add('hidden');
            break;
        case 'max':
            info = 'Finds the maximum value in the specified range.';
            rangeContainer.classList.remove('hidden');
            defaultContainer.classList.add('hidden');
            break;
        case 'min':
            info = 'Finds the minimum value in the specified range.';
            rangeContainer.classList.remove('hidden');
            defaultContainer.classList.add('hidden');
            break;
        case 'isnumber':
            info = 'Checks if the value is a number and returns the value or a default value.';
            rangeContainer.classList.add('hidden');
            defaultContainer.classList.remove('hidden');
            break;
    }

    infoElement.textContent = info;
}

function updateHistoryDisplay() {
    const historyElement = document.getElementById('formula-history');

    if (formulaHistory.length === 0) {
        historyElement.innerHTML = '<p>Your formula history will appear here.</p>';
        return;
    }

    let historyHTML = '';
    formulaHistory.forEach((formula, index) => {
        historyHTML += `<div class="history-item"><div class="content-history-item" onclick="useHistoryItem(${index})">${formula}</div><div class="history-item-action"><button class="remove-mapping" onclick="removeHistoryItem(${index})"><i class="fas fa-trash-alt"></i></button></div></div>`;
    });

    historyElement.innerHTML = historyHTML;
}

function updateOutput(formula) {
    const outputElement = document.getElementById('formula-output');
    outputElement.textContent = formula;

    formulaHistory.unshift(formula);
    if (formulaHistory.length > 20) {
        formulaHistory.pop();
    }

    localStorage.setItem('formulaHistory', JSON.stringify(formulaHistory));

    updateHistoryDisplay();
}

function useHistoryItem(index) {
    const formula = formulaHistory[index];
    document.getElementById('formula-output').textContent = formula;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('date-calc').addEventListener('change', toggleDateCalcOptions);

    updateBasicFormulaInfo();
    toggleTextOptions();
    toggleDateOptions();

    document.querySelectorAll('.mapping-from, .mapping-to').forEach(input => {
        input.style.display = 'block';
        input.style.visibility = 'visible';
        input.style.color = 'white';
    });

    document.querySelectorAll('.mapping-from, .mapping-to').forEach(input => {
        input.addEventListener('input', function () {
            console.log('Digitando:', this.value);
        });
    });

    document.getElementById('mapping-pairs').addEventListener('input', function (event) {
        if (
            event.target.classList.contains('mapping-from') ||
            event.target.classList.contains('mapping-to')
        ) {
            console.log('Novo input digitado:', event.target.value);
        }
    });
});
