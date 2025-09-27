# Ward Metrics Calculator

A web-based application for calculating hospital ward metrics such as Bed Occupancy Rate (BOR), Bed Turnover Rate (BTR), Average Length of Stay (ALOS), and Turnover Interval (TI) based on patient admission and discharge data.

## Features

- **CSV Data Processing**: Upload CSV files containing patient admission and discharge data
- **Ward Metrics Calculation**: Automatically calculates key hospital ward performance indicators
- **Interactive Interface**: User-friendly web interface with date range selection and dynamic ward listing
- **Printable Reports**: Generate printable reports with properly formatted tables
- **Responsive Design**: Built with Bootstrap for compatibility across devices

## Files Structure
├── index.html # Main application interface
├── calculate.php # Backend PHP script for data processing
├── calculations.js # Frontend JavaScript for calculations and UI
└── print.css # CSS styles for printing optimization

## Requirements

- Web server with PHP support (Apache, Nginx, etc.)
- Modern web browser with JavaScript enabled

## Installation

1. Clone or download the repository to your web server directory
2. Ensure PHP is properly configured on your server
3. Upload the four files to your web-accessible directory

## Usage

### 1. Access the Application
- Navigate to `index.html` in your web browser

### 2. Input Data
- **Select Date Range**: Choose start and end dates for the analysis period
- **Upload CSV File**: Provide a CSV file with the following format:
  - Column 1: Admission dates (YYYY-MM-DD format)
  - Column 2: Discharge dates (YYYY-MM-DD format)  
  - Column 3: Ward numbers/names

### 3. Generate Ward List
- Click "Ward List" to extract and display unique wards from your CSV file

### 4. Set Bed Counts
- For each ward, select the number of beds from the dropdown (0-500)

### 5. Calculate Metrics
- Click "Calculate" to generate the metrics table showing:
  - Bed Count
  - Total Inpatient Days (TID)
  - Admissions
  - Discharges
  - Bed Occupancy Rate (BOR)
  - Bed Turnover Rate (BTR)
  - Average Length of Stay (ALOS)
  - Turnover Interval (TI)

### 6. Print Results
- Use "Print Results" to generate a printer-friendly version of the report

## CSV Format Example
admission_date,discharge_date,ward
2023-01-01,2023-01-05,Ward A
2023-01-02,2023-01-07,Ward B
2023-01-03,2023-01-06,Ward A


## Calculated Metrics

- **BOR (Bed Occupancy Rate)**: Percentage of bed days occupied
- **BTR (Bed Turnover Rate)**: Number of discharges per bed per day
- **ALOS (Average Length of Stay)**: Average duration of patient stays
- **TI (Turnover Interval)**: Average time between discharge and next admission

## Technical Details

### Backend (calculate.php)
- Processes CSV files and calculates TID, admissions, and discharges
- Handles date range filtering and ward-based calculations
- Returns JSON data for frontend processing

### Frontend (calculations.js)
- Handles user interactions and form submissions
- Performs metric calculations using the data from PHP
- Generates dynamic tables and handles printing functionality

### Styling
- Bootstrap 4 for responsive UI design
- Custom print styles for optimal printing results

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is open source and available under the [MIT License](LICENSE).
