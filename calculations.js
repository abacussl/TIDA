
// calculations.js
console.log('calculations.js loaded successfully');

function calculateNumberOfDays(startDate, endDate) {
    // Calculate the difference in milliseconds
    const timeDifference = new Date(endDate) - new Date(startDate);

    // Calculate the number of days and add 1
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) + 1;
}

function loadWardList() {
    console.log('function loadWardList() called');
    // Fetch data from the form
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const csvFile = document.getElementById('csvFile').files[0];

    // Create FormData object to send data to server
    const formData = new FormData();
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('csvFile', csvFile);

    // Use AJAX to send form data to calculate.php
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'calculate.php', true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Parse JSON response
            const responseData = JSON.parse(xhr.responseText);

            // Display ward list and input fields
            displayWardList(responseData.tidByWard);
        }
    };
    xhr.send(formData);
}

// Function to display ward list and input fields
function displayWardList(wardList) {
    // Sort wards numerically first, then alphabetically without numerals
    const sortedWards = Object.keys(wardList).sort((a, b) => {
        const numComparison = parseInt(a.replace(/\D/g, ''), 10) - parseInt(b.replace(/\D/g, ''), 10);

        if (numComparison === 0) {
            // If numeric comparison is the same, sort alphabetically without numerals
            const aWithoutNum = a.replace(/[0-9]/g, '');
            const bWithoutNum = b.replace(/[0-9]/g, '');
            return aWithoutNum.localeCompare(bWithoutNum);
        }

        return numComparison;
    });

    const wardInputsDiv = document.getElementById('wardInputs');
    wardInputsDiv.innerHTML = ''; // Clear previous content

    // Display input fields for each ward
    sortedWards.forEach(ward => {
        const wardLabel = document.createElement('label');
        wardLabel.innerText = `Beds for Ward → ${ward}`;
        wardInputsDiv.appendChild(wardLabel);

        // Create dropdown for bed numbers
        const bedDropdown = document.createElement('select');
        bedDropdown.classList.add('form-control');
        bedDropdown.name = `beds_${ward}`;
        for (let i = 0; i <= 500; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.text = i;
            bedDropdown.appendChild(option);
        }
        wardInputsDiv.appendChild(bedDropdown);
    });
}



// Function to fetch all data including TID, admissions, and discharges
function fetchAllData(startDate, endDate, csvFile) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('csvFile', csvFile);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'calculate.php', true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                try {
                    const responseData = JSON.parse(xhr.responseText);

                    // Check if the response contains the necessary data
                    if (responseData && responseData.tidByWard) {
                        resolve(responseData);
                    } else {
                        reject('Invalid response format');
                    }
                } catch (error) {
                    reject('Error parsing JSON response');
                }
            } else {
                reject('Error fetching data');
            }
        };
        xhr.onerror = function () {
            reject('Network error occurred');
        };
        xhr.send(formData);
    });
}
/*// Function to fetch TID values for each ward
function fetchTIDValues(startDate, endDate, csvFile) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('csvFile', csvFile);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'calculate.php', true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                const tidValues = JSON.parse(xhr.responseText);
                resolve(tidValues);
            } else {
                reject('Error fetching TID values');
            }
        };
        xhr.onerror = function () {
            reject('Network error occurred');
        };
        xhr.send(formData);
    });
}

*/

// Function to fetch bed and TID numbers from input fields and perform calculations
// Display the result table in the #resultTable div
// Function to perform calculations and update the result table
// Update the existing calculateTable function


/*// Updated fetchAllData function
async function fetchAllData(startDate, endDate, csvFile) {
    try {
        const response = await fetchTIDValues(startDate, endDate, csvFile);
        return response;
    } catch (error) {
        throw new Error('Error fetching data');
    }
}*/

// Updated calculateTable function
async function calculateTable() {
    console.log('calculateTable function called');

    // Fetch bed numbers, TID values, admissions, and discharges
    const wardData = {};
    const wardInputsDiv = document.getElementById('wardInputs');
    const inputFields = wardInputsDiv.querySelectorAll('select');
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const csvFile = document.getElementById('csvFile').files[0];

    try {
        // Fetch all data including TID, admissions, and discharges
        const allData = await fetchAllData(startDate, endDate, csvFile);

        // Calculate the number of days
        const numberOfDays = calculateNumberOfDays(startDate, endDate);

       // Inside inputFields.forEach loop
		inputFields.forEach((inputField, index) => {
			const wardName = inputField.name.substring(5);
			const bedCount = inputField.value;

			// Use the fetched data for the ward
			const wardInfo = allData.tidByWard[wardName];
			const admissionsValue = allData.admissionsByWard[wardName] || 0;
			const dischargesValue = allData.dischargesByWard[wardName] || 0;

			const tidValue = wardInfo ? wardInfo : 0;

			wardData[wardName] = {
				bedCount: bedCount,
				tidValue: tidValue,  // Use tidValue directly
				admissionsValue: admissionsValue,
				dischargesValue: dischargesValue,
			};
		});


        // Perform calculations
        const calculatedResults = calculateMetrics(wardData, numberOfDays);

        // Generate the result table HTML
        const resultTableHTML = generateResultTable(calculatedResults);

        // Update the #resultTable div with the calculated result
        const resultTableDiv = document.getElementById('resultTable');
        resultTableDiv.innerHTML = resultTableHTML;

        // Add print styles using JavaScript
        const printStyles = `
            body {
                font-size: 12pt;
            }

            .table {
                border-collapse: separate;
                border-spacing: 10px; /* Adjust the value to increase or decrease the gap */
            }

            th, td {
                padding: 10px; /* Optional: Add padding to cells for better spacing */
            }
        `;

        // Create a style element for print styles
        const printStyleElement = document.createElement('style');
        printStyleElement.innerHTML = printStyles;

        // Append the style element to the document head
        document.head.appendChild(printStyleElement);
    } catch (error) {
        console.error(error);
    }
}
   
/*
// Example function to calculate metrics (replace this with your actual logic)
function calculateMetrics(tidByWard, admissionsByWard, dischargesByWard) {
    const calculatedResults = [];

    // Iterate through each ward in tidByWard
    for (const wardName in tidByWard) {
        if (tidByWard.hasOwnProperty(wardName)) {
            const tidValue = tidByWard[wardName];
            const bedCount = wardData[wardName].bedCount;
            const admissionsValue = admissionsByWard[wardName] || 0;
            const dischargesValue = dischargesByWard[wardName] || 0;

            // Calculate other metrics as needed
            const bor = parseFloat((tidValue / bedCount / numberOfDays * 100).toFixed(2));

            calculatedResults.push({
                wardName: wardName,
                bedCount: bedCount,
                tidValue: tidValue,
                admissionsValue: admissionsValue,
                dischargesValue: dischargesValue,
                bor: bor
                // Add other calculated metrics as needed
            });
        }
    }

    // Sort the calculatedResults array by wardName in ascending order
    calculatedResults.sort((a, b) => a.wardName.localeCompare(b.wardName));

    return calculatedResults;
}
*/
function calculateMetrics(wardData, numberOfDays) {
    const calculatedResults = [];

    // Iterate through each ward in wardData
    for (const wardName in wardData) {
        if (wardData.hasOwnProperty(wardName)) {
            const ward = wardData[wardName];

            // Use the fetched data for the ward
            const tidValue = ward.tidValue;
            const bedCount = ward.bedCount;
            const admissionsValue = ward.admissionsValue;
            const dischargesValue = ward.dischargesValue;

            // Calculate additional metrics
            const btr = parseFloat((dischargesValue / bedCount / numberOfDays).toFixed(2));
            const alos = parseFloat((tidValue / dischargesValue).toFixed(2));
            const ti = parseFloat((365 / btr) - alos).toFixed(2);

            calculatedResults.push({
                wardName: wardName,
                bedCount: bedCount,
                tidValue: tidValue,
                admissionsValue: admissionsValue,
                dischargesValue: dischargesValue,
                bor: parseFloat((tidValue / bedCount / numberOfDays * 100).toFixed(2)),
                btr: btr,
                alos: alos,
                ti: ti
                // Add other calculated metrics as needed
            });
        }
    }

    // Sort the calculatedResults array by wardName using the same sorting logic
    calculatedResults.sort((a, b) => {
        const numComparison = parseInt(a.wardName.replace(/\D/g, ''), 10) - parseInt(b.wardName.replace(/\D/g, ''), 10);

        if (numComparison === 0) {
            // If numeric comparison is the same, sort alphabetically without numerals
            const aWithoutNum = a.wardName.replace(/[0-9]/g, '');
            const bWithoutNum = b.wardName.replace(/[0-9]/g, '');
            return aWithoutNum.localeCompare(bWithoutNum);
        }

        return numComparison;
    });

    return calculatedResults;
}




function generateResultTable(calculatedResults) {
    let tableHTML = '<table class="table">';
    tableHTML += '<thead><tr><th>#</th><th>Ward Name</th><th>Bed Count</th><th>TID Value</th><th>Admissions</th><th>Discharges</th><th>BOR</th><th>BTR</th><th>ALOS</th><th>TI</th></tr></thead>';
    tableHTML += '<tbody>';

    let totalBeds = 0;
    let totalTID = 0;
    let totalAdmissions = 0;
    let totalDischarges = 0;
    let totalBOR = 0;
    let totalBTR = 0;
    let totalALOS = 0;
    let totalTI = 0;

    calculatedResults.forEach((result, index) => {
        // Accumulate totals
        totalBeds += parseInt(result.bedCount, 10);
        totalTID += parseInt(result.tidValue, 10);
        totalAdmissions += parseInt(result.admissionsValue, 10);
        totalDischarges += parseInt(result.dischargesValue, 10);
        totalBOR += parseFloat(result.bor);
        
        // Assuming you have additional properties in calculatedResults for BTR, ALOS, and TI
        totalBTR += parseFloat(result.btr || 0);
        totalALOS += parseFloat(result.alos || 0);
        totalTI += parseFloat(result.ti || 0);

        tableHTML += `<tr><td>${index + 1}</td><td>${result.wardName}</td><td>${result.bedCount}</td><td>${result.tidValue}</td><td>${result.admissionsValue}</td><td>${result.dischargesValue}</td><td>${result.bor}</td><td>${result.btr}</td><td>${result.alos}</td><td>${result.ti}</td></tr>`;
    });

    // Calculate averages
    const rowCount = calculatedResults.length;
    const avgBOR = (totalBOR / rowCount).toFixed(2);
    const avgBTR = (totalBTR / rowCount).toFixed(2);
    const avgALOS = (totalALOS / rowCount).toFixed(2);
    const avgTI = (totalTI / rowCount).toFixed(2);

    // Add total row to the table
    tableHTML += `<tr class="table-info"><td colspan="2">Total</td><td>${totalBeds}</td><td>${totalTID}</td><td>${totalAdmissions}</td><td>${totalDischarges}</td><td>${avgBOR}</td><td>${avgBTR}</td><td>${avgALOS}</td><td>${avgTI}</td></tr>`;

    tableHTML += '</tbody></table>';

    return tableHTML;
}


/*const xhr = new XMLHttpRequest();
xhr.open('POST', 'calculate.php', true);
xhr.onload = function () {
    if (xhr.status === 200) {
        // Parse JSON response
        const wardList = JSON.parse(xhr.responseText);

        // Display ward list and input fields
        displayWardList(wardList);
    } else {
        console.error('Error in AJAX request:', xhr.statusText);
    }
};
xhr.onerror = function () {
    console.error('Network error occurred.');
};*/
function calculateTotalAdmissions(admissionDates, startDate, endDate) {
    let totalAdmissions = 0;

    for (const admissionDate of admissionDates) {
        const admission = new Date(admissionDate);

        // Check if the admission date is within the specified range
        if (admission >= startDate && admission <= endDate) {
            totalAdmissions++;
        }
    }

    return totalAdmissions;
}
/*function printResults() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const title = `Hospital Metrics from ${startDate} to ${endDate}`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>' + title + '</title></head><body>');

    // Include your result table HTML here
    const resultTableDiv = document.getElementById('resultTable');
    printWindow.document.write('<h1 style="text-align: center;">' + title + '</h1>');
    printWindow.document.write(resultTableDiv.innerHTML);

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}*/
/*// Updated printResults function with center alignment styles
function printResults() {
	
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const title = `Ward Metrics \n <h2 style="text-align: center;">Teaching Hospital - Kurunegala<\h2> \n <h3 style="text-align: center;">from ${startDate} to ${endDate}</h3>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>' + title + '</title>');
    printWindow.document.write('<style>table {text-align: center;}</style></head><body>');

    // Include your result table HTML here
    const resultTableDiv = document.getElementById('resultTable');
    printWindow.document.write('<h1 style="text-align: center;">' + title + '</h1>');
    printWindow.document.write(resultTableDiv.innerHTML);

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}*/
function printResults() {
	const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const resultTableDiv = document.getElementById('resultTable');
    const title = `Ward Metrics \n <h2 style="text-align: center;">Teaching Hospital - Kurunegala<\h2> \n <h3 style="text-align: center;">from ${startDate} to ${endDate}</h3>`;
    
    // Generate the result table HTML with the title
    const resultTableHTML = `<h2 class="text-center">${title}</h2>${resultTableDiv.innerHTML}`;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Set the content of the new window
    printWindow.document.write(`
        <html>
        <head>
            <title>Print</title>
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
                integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
            <style>
                body {
                    font-size: 12pt;
                }

                .table {
                    border-collapse: separate;
                    border-spacing: 5px; /* Adjust the value to increase or decrease the gap */
                }

                th, td {
                    padding: 10px; /* Optional: Add padding to cells for better spacing */
                    text-align: center; /* Align table content center */
                }
            </style>
        </head>
        <body>
            ${resultTableHTML}
        </body>
        </html>
    `);

    // Close the document stream
    printWindow.document.close();

    // Print the new window
    printWindow.print();
}
