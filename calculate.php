<?php

/*if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get start date, end date, and CSV file
    $startDate = $_POST['startDate'];
    $endDate = $_POST['endDate'];
    $csvFile = $_FILES['csvFile']['tmp_name'];

    // Process CSV file and extract unique ward numbers
    $wardList = getUniqueWardList($csvFile);

    // Calculate Total Inpatient Days (TID) for each ward based on the date range
    $tidByWard = calculateTID($startDate, $endDate, $csvFile);

    // Return the calculated TID as JSON
    header('Content-Type: application/json');
    echo json_encode($tidByWard);
} else {
    // Handle other HTTP methods or direct access to the file
    http_response_code(405);
    echo 'Method Not Allowed';
}*/
function customSign($number) {
    if ($number > 0) {
        return 1;
    } elseif ($number < 0) {
        return -1;
    } else {
        return 0;
    }
}
	
// Function to calculate Total Inpatient Days (TID) for each ward
function calculateTID($startDate, $endDate, $csvFile) {
    $admissionsByWard = [];
    $dischargesByWard = [];
	$tidByWard = [];
	$admissionDates = [];
    $dischargeDates = [];
    $wardNumbers = [];

    if (($handle = fopen($csvFile, 'r')) !== FALSE) {
        // Skip the header row
        fgetcsv($handle);

        // Read the CSV file row by row
        while (($data = fgetcsv($handle, 1000, ',')) !== FALSE) {
            $admissionDates[] = $data[0]; // Assuming admission dates are in the first column
            $dischargeDates[] = $data[1]; // Assuming discharge dates are in the second column
            $wardNumbers[] = $data[2];    // Assuming ward numbers are in the third column
        }

        fclose($handle);
    }

    //$tidByWard = [];
    //$admissionsByWard = [];
    //$dischargesByWard = [];

    for ($i = 0; $i < count($admissionDates); $i++) {
        if ($admissionDates[$i] != "") {
            $admission = strtotime($admissionDates[$i]);
            $discharge = strtotime($dischargeDates[$i]);
            $start = strtotime($startDate);
            $end = strtotime($endDate);

            // Check if the date pair is problematic
            if ($admission > $discharge) {
                // Skip problematic date pair
                continue;
            }

            $ward = $wardNumbers[$i];

            if ($admission > $end || $discharge < $start) {
                // Skip if outside date range
                continue;
            } elseif ($admission >= $end || $admission == $discharge) {
                $inpatientDays = 1;
            } elseif ((customSign($discharge - $end) + customSign($end - $admission) + customSign($admission - $start)) == 3) {
                $inpatientDays = round(($end - $admission) / (60 * 60 * 24));
         //   } elseif ($discharge >= $end && $admission > $start) {
                $inpatientDays = round(($end - $admission + 86400 ) / (60 * 60 * 24));
          //  } elseif ($discharge = $end && $admission > $start) {
           //     $inpatientDays = ($end - $admission  ) / (60 * 60 * 24);
          //  } elseif ($admission > $start ) {
            //    $inpatientDays = ($end - $admission + 86400 ) / (60 * 60 * 24);  
            } elseif ($admission > $start && $discharge <= $end ) {
                $inpatientDays = round(($discharge - $admission ) / (60 * 60 * 24));
              
            } elseif ($discharge < $end) {
                $inpatientDays = round(($discharge - $start) / (60 * 60 * 24));
           } elseif ($discharge > $end) {
               $inpatientDays = round(($end - $start + 86400) / (60 * 60 * 24));
            } elseif ($discharge = $end) {
                $inpatientDays = round(($end - $start) / (60 * 60 * 24));
            } elseif ($admission < $start) {
                $inpatientDays = round(($discharge - $start + 86400) / (60 * 60 * 24));
            
           } elseif ($admission = $start) {
                $inpatientDays = round(($discharge - $admission) / (60 * 60 * 24));
            
            } else {
                $inpatientDays = 0;
            }
           // Calculate admissions for the ward
        if ($admission > $start && $admission <= $end) {
            if (!isset($admissionsByWard[$ward])) {
                $admissionsByWard[$ward] = 0;
            }
            $admissionsByWard[$ward]++;
        }

        // Calculate discharges for the ward
        if ($discharge >= $start && $discharge <= $end) {
            if (!isset($dischargesByWard[$ward])) {
                $dischargesByWard[$ward] = 0;
            }
            $dischargesByWard[$ward]++;
        }

            // Update TID for the ward
            if (!isset($tidByWard[$ward])) {
                $tidByWard[$ward] = 0;
            }

            $tidByWard[$ward] += $inpatientDays;
        }
    }

    $result = [
        'tidByWard' => $tidByWard,
        'admissionsByWard' => $admissionsByWard,
        'dischargesByWard' => $dischargesByWard,
    ];
	// Ensure JSON content type header is set
	header('Content-Type: application/json');

	echo json_encode([
    'tidByWard' => $tidByWard,
    'admissionsByWard' => $admissionsByWard,
    'dischargesByWard' => $dischargesByWard,
]);

    return $result;
}

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $startDate = $_POST['startDate'];
    $endDate = $_POST['endDate'];
    $csvFile = $_FILES['csvFile']['tmp_name'];

    // Calculate TID for each ward
    $tidByWard = calculateTID($startDate, $endDate, $csvFile);

    // Process CSV file and extract unique ward names with counts
    $wardList = getUniqueWardList($csvFile);
	
   // Return the result as JSON
    header('Content-Type: application/json');
   // echo json_encode($tidByWard);
	/*echo json_encode([
    'tidByWard' => $tidByWard,
    'admissionsByWard' => $admissionsByWard,
    'dischargesByWard' => $dischargesByWard,
]);*/
} else {
    http_response_code(405);
    echo 'Method Not Allowed';
}


// Function to extract unique ward numbers from CSV file and sort in ascending order
function getUniqueWardList($csvFile) {
    $wardList = [];

    if (($handle = fopen($csvFile, 'r')) !== FALSE) {
        // Skip the header row
        fgetcsv($handle);

        // Read the CSV file row by row
        while (($data = fgetcsv($handle, 1000, ',')) !== FALSE) {
            // Extract ward number from the third column
            $ward = $data[2];

            // Add ward to the list if not already present
            if (!in_array($ward, $wardList)) {
                $wardList[] = $ward;
            }
        }

        fclose($handle);
    }

    // Sort the ward numbers in natural order
    natsort($wardList);

    return $wardList;
}

?>
