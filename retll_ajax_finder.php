<?php 
//will perform and return de values found
//related to reticle status -- lead lot by Process ID
	require('../inc/header.inc.php');
	require('../inc/admin.auth.inc.php');
	require('../inc/auth.inc.php');

	#including conn.php to connect to MFGINFO
	include '../conn/ora_conn.php';

	$var_ProcIDs = $_POST["proc_IDs"];
	$var_ProcIDs = strtoupper($var_ProcIDs);
	$duplicates = 0; //will storage the duplicates process ids
	if ($var_ProcIDs == "") {
		# validating if string is empty, not perform search in DB
		return "Process ID - Empty String. Check input box";
	}
	else{
		#Checking the cookies, to avoid duplicates and to keep the previous
		#devices added if any.
		if (!isset($_COOKIE['retll_procs'])) {
			# if cookie doesn't exist, it's created and the first 
			# device(s) added to it.
			setcookie('retll_procs', $var_ProcIDs);
		} else {
			# if the cookie already exist, it should be performed a duplicates checking
			# and create a new string with all proc IDs. In case a duplicate is found
			# save it to return it to inform the user.
			//Creating one string, it contains all the process
			$var_ProcIDs = $_COOKIE['retll_procs'].','.$var_ProcIDs;
			//Checking for duplicates
			$t_ProcIds_array = explode(',', $var_ProcIDs);
			$t_duplicates_count = array_count_values($t_ProcIds_array);
			//finding duplicates
			foreach ($t_duplicates_count as $key => $value) {
				# finding process Ids duplicated
				if ($value > 1) { //means we found a duplicate
					$duplicates = $duplicates . "," . $key;
				}
			}
			//removing duplicates
			$var_ProcIDs = implode(',', array_unique(explode(',', $var_ProcIDs)));
			//saving to cookie the new process
			setcookie('retll_procs', $var_ProcIDs);
		}
		// echo "procs ".$var_ProcIDs." duplicates ".$duplicates;
		#at this point, $var_ProcIDs contains all the process plans that 
		#we want to search the reticle for; and $duplicates contains all 
		#duplicates found.
		#Proceed to search inventory in MFGINFO per each process plan contained
		#in $var_ProcIDs.

		#Creating array with all process IDs
		$proc_IDs_array = explode(',', $var_ProcIDs);
		#getting total number of Process IDs to chekc in DB
		$total_ProcIDs = count($proc_IDs_array);

		# create navtabs string
		$str_navtabs = '
			<div>
				<!-- Nav tabs -->
				<ul class="nav nav-tabs" role="tablist">
		';
		# create Tab Panes content string
		$str_tabpanes = '
			<div class="tab-content">
		';
		foreach ($proc_IDs_array as $index => $ProcID) {
			# checking DB per Process ID
			# Per each Process ID this loop will create a 
			# Tab to present the information to the user.
			$var_strSQL = "SELECT * FROM MI_CURRENT_WIP WHERE PROCESS_ID = '".$ProcID."' AND CURRENT_LINE_ID = 'SFBX' ORDER BY STEP_SEQ DESC";

			#performing the logic of the query
			$query_results = oci_parse($ora_conn, $var_strSQL);
			oci_execute($query_results);
			$numrows = oci_fetch_array($query_results, OCI_ASSOC+OCI_RETURN_NULLS);

			#Creating Tab even if the Process ID doesn't exist
			if ($index == 0) {
				$str_navtabs .= '
					<li role="presentation" class="active"><a href="#'.$ProcID.'" aria-controls="'.$ProcID.'" role="tab" data-toggle="tab">'.$ProcID.'</a></li>
				';
			} else {
				$str_navtabs .= '
					<li role="presentation"><a href="#'.$ProcID.'" aria-controls="'.$ProcID.'" role="tab" data-toggle="tab">'.$ProcID.'</a></li>
			';
			}
			#checking if the Process ID exists
			if ($numrows == 0) {
				# Adding message to the tab result to inform the user
				# checking if the empty tab is the first
				if ($index == 0) {
					$str_tabpanes .= '<div role="tabpanel" class="tab-pane active" id="'.$ProcID.'">No found</div>';
				} else {
					# removing active class if it's not the first Process ID
					$str_tabpanes .= '<div role="tabpanel" class="tab-pane" id="'.$ProcID.'">No found</div>';
				}
			} else {
				#defining lot counter
				$lot_counter = 0;
				#clearing first fecth in order to get all result
				#in while loop below
				oci_free_statement($query_results);
				#performing the logic of the query again
				$query_results = oci_parse($ora_conn, $var_strSQL);
				oci_execute($query_results);

				if ($index == 0) {
					$str_tabpanes .= '
						<div role="tabpanel" class="tab-pane active" id="'.$ProcID.'">
							<table class="table table-hover table-striped alg-mid">
						        <thead>
						          <tr>
						            <th>#</th>
						            <th>Lot ID</th>
						            <th>Wafer Qty</th>
						            <th>Lot Type</th>
						            <th>Priority</th>
						            <th>Step Sequence</th>
						            <th>Step Description</th>
						            <th>Current Status</th>
						            <th>Time @ Step (Hrs)</th>
						          </tr>
						        </thead>
						        <tbody>
					';
					while (($num_rows_h = oci_fetch_array($query_results, OCI_BOTH)) != false) {
						$lot_counter = $lot_counter + 1;
					  	$str_tabpanes .= '
					  		<tr>
								<th scope="row">'.$lot_counter.'</th>
					            <td>'.oci_result($query_results, 'LOT_ID').'</td>
					            <td>'.oci_result($query_results, 'CURRENT_COMPNT_QTY').'</td>
					            <td>'.oci_result($query_results, 'LOT_TYPE').'</td>
					            <td>'.oci_result($query_results, 'LOT_PROCESS_PRITY').'</td>
					            <td>'.oci_result($query_results, 'STEP_SEQ').'</td>
					            <td>'.oci_result($query_results, 'STEP_DESC').'</td>
					            <td>'.oci_result($query_results, 'WORK_STATUS_SEG').'</td>';
					            $last_trackout = strtotime(oci_result($query_results, 'LAST_TKOUT_TIME'));
							    $right_now = time();
							    $hrs_step = ($right_now - $last_trackout)/(60*60);
					    $str_tabpanes .= '
					    		<td>'.round($hrs_step, 2).'</td>
					        </tr>
					  	';
					  	# Adding information about the reticle status for the lead lot
					  	if ($lot_counter == 1) {
					  		#defining new query variable AND NEW QUERY
					  		#this query will return the remaining litho layers
					  		#the first value will be the closest litho step ahead. (we may need to use rownum=1 here)
					  		$var_RetInfo_Step = "SELECT * FROM MI_STEP WHERE (PROCESS_ID = '".$ProcID."' AND EQP_TYPE = 'PMAINF' AND STEP_SEQ > '".oci_result($query_results, 'STEP_SEQ')."') ORDER BY STEP_SEQ ASC";
					  		$query_results_II = oci_parse($ora_conn, $var_RetInfo_Step);
							oci_execute($query_results_II);
							oci_fetch_array($query_results_II, OCI_BOTH);

							#getting next litho step seq
							$next_lihto_SS = oci_result($query_results_II, 'STEP_SEQ');
							$next_lihto_SD = oci_result($query_results_II, 'STEP_DESC');

							#clearing query vars to get reticle information
							#for some cases we will have more than 1 TIP entry for the same step. Chances are:
							# 1. Several tools are qualified to run this step but using the same reticle ID.
							# 2. We have several TIP entries but with different reticle IDs because of a revision for this mask.
							# For both cases we have to handle the results we will be showing.
							oci_free_statement($query_results_II);
							#SQL query used to be:
							// $var_RetInfo = "SELECT RETICLE_ID, RETICLE_STATUS_SEG, CUR_STATUS_SEG FROM MI_RETICLE WHERE RETICLE_ID = (SELECT RETICLE_ID FROM MI_TKIN_PREVENT WHERE PROCESS_ID = '".$ProcID."' AND STEP_SEQ = '".$next_lihto_SS."')";

							# Portion to determine if there are several TIP Entries
							# 1. Prep and execute the query to TIP Table.
							$var_RetIDs_SQL = "SELECT RETICLE_ID FROM MI_TKIN_PREVENT WHERE PROCESS_ID = '".$ProcID."' AND STEP_SEQ = '".$next_lihto_SS."'";

							$query_ret_ids_info = oci_parse($ora_conn, $var_RetIDs_SQL);
							oci_execute($query_ret_ids_info);
							# getting all elements from the query
							$num_ret_ids = array();
							while (($rows_ret_ids = oci_fetch_array($query_ret_ids_info, OCI_BOTH)) != false) {
								$num_ret_ids[] = oci_result($query_ret_ids_info, 'RETICLE_ID');
							}

							#checking number of ret IDs found
							if (count($num_ret_ids) == 1) {
								# just one ret ID found - handling code
								# saving ret id to a variable
								# getting the reticle information from MI_RETICLE Table
								$var_RetInfo = "SELECT RETICLE_ID, RETICLE_STATUS_SEG, CUR_STATUS_SEG FROM MI_RETICLE WHERE RETICLE_ID = '".$num_ret_ids[0]."'";
								# executing query
								$query_ret_info = oci_parse($ora_conn, $var_RetInfo);
								oci_execute($query_ret_info);
								oci_fetch_array($query_ret_info, OCI_BOTH);

								$str_tabpanes .= '
						  			<div class="row">
										<h4>Next Litho Step Information</h4>
										<div class="col-md-2">'.$next_lihto_SS.'</div>
										<div class="col-md-3">'.$next_lihto_SD.'</div>
										<div class="col-md-2">'.oci_result($query_ret_info, 'RETICLE_ID').'</div>
										<div class="col-md-2">'.oci_result($query_ret_info, 'RETICLE_STATUS_SEG').'</div>
										<div class="col-md-2">'.oci_result($query_ret_info, 'CUR_STATUS_SEG').'</div>
									</div>
									<br />
						  		';
							} elseif (count($num_ret_ids) > 1) {
								# more than one reticle id found or more than one TIP entry
								# we have to check if it's one case or the other by checking if the reticle ID is the same
								# first, we remove duplicates, since it's possible to have several entries with the same ret ID.
								$unique_ret_ids = array_unique($num_ret_ids);
								# counting how many unique values we have
								if (count($unique_ret_ids) == 1) {
									# means several TIP entries for the same ret ID.
									oci_free_statement($query_ret_ids_info);
									# getting the reticle information from MI_RETICLE Table
									$var_RetInfo = "SELECT RETICLE_ID, RETICLE_STATUS_SEG, CUR_STATUS_SEG FROM MI_RETICLE WHERE RETICLE_ID = '".$unique_ret_ids[0]."'";
									# executing query
									$query_ret_info = oci_parse($ora_conn, $var_RetInfo);
									oci_execute($query_ret_info);
									oci_fetch_array($query_ret_info, OCI_BOTH);

									$str_tabpanes .= '
							  			<div class="row">
											<h4>Next Litho Step Information</h4>
											<div class="col-md-2">'.$next_lihto_SS.'</div>
											<div class="col-md-3">'.$next_lihto_SD.'</div>
											<div class="col-md-2">'.oci_result($query_ret_info, 'RETICLE_ID').'</div>
											<div class="col-md-2">'.oci_result($query_ret_info, 'RETICLE_STATUS_SEG').'</div>
											<div class="col-md-2">'.oci_result($query_ret_info, 'CUR_STATUS_SEG').'</div>
										</div>
										<br />
							  		';
								} elseif (count($unique_ret_ids) > 1) {
									# means we have different reticle ids that can run at this step
									$str_tabpanes .= '
										<h4>Next Litho Step Information</h4>
									';
									foreach ($unique_ret_ids as $ret_id) {
										# making a query for each reticle ID and adding the results to the final string
										oci_free_statement($query_ret_ids_info);
										# getting the reticle information from MI_RETICLE Table
										$var_RetInfo = "SELECT RETICLE_ID, RETICLE_STATUS_SEG, CUR_STATUS_SEG FROM MI_RETICLE WHERE RETICLE_ID = '".$ret_id."'";
										# executing query
										$query_ret_info = oci_parse($ora_conn, $var_RetInfo);
										oci_execute($query_ret_info);
										oci_fetch_array($query_ret_info, OCI_BOTH);

										$str_tabpanes .= 
											'<div class="row">
												<div class="col-md-2">'.$next_lihto_SS.'</div>
												<div class="col-md-3">'.$next_lihto_SD.'</div>
												<div class="col-md-2">'.oci_result($query_ret_info, 'RETICLE_ID').'</div>
												<div class="col-md-2">'.oci_result($query_ret_info, 'RETICLE_STATUS_SEG').'</div>
												<div class="col-md-2">'.oci_result($query_ret_info, 'CUR_STATUS_SEG').'</div>
											</div>
											<br />
								  		';
									}
								}
							}
					  	}
					}
					$str_tabpanes .='
						</tbody>
						</table></div>';
				} else {
					$str_tabpanes .= '
						<div role="tabpanel" class="tab-pane" id="'.$ProcID.'">
							<table class="table table-hover table-striped alg-mid">
						        <thead>
						          <tr>
						            <th>#</th>
						            <th>Lot ID</th>
						            <th>Wafer Qty</th>
						            <th>Lot Type</th>
						            <th>Priority</th>
						            <th>Step Sequence</th>
						            <th>Step Description</th>
						            <th>Current Status</th>
						            <th>Time @ Step (Hrs)</th>
						          </tr>
						        </thead>
						        <tbody>
					';
					while (($num_rows_h = oci_fetch_array($query_results, OCI_BOTH)) != false) {
						$lot_counter = $lot_counter + 1;
					  	$str_tabpanes .= '
					  		<tr>
								<th scope="row">'.$lot_counter.'</th>
					            <td>'.oci_result($query_results, 'LOT_ID').'</td>
					            <td>'.oci_result($query_results, 'CURRENT_COMPNT_QTY').'</td>
					            <td>'.oci_result($query_results, 'LOT_TYPE').'</td>
					            <td>'.oci_result($query_results, 'LOT_PROCESS_PRITY').'</td>
					            <td>'.oci_result($query_results, 'STEP_SEQ').'</td>
					            <td>'.oci_result($query_results, 'STEP_DESC').'</td>
					            <td>'.oci_result($query_results, 'WORK_STATUS_SEG').'</td>';
					            $last_trackout = strtotime(oci_result($query_results, 'LAST_TKOUT_TIME'));
							    $right_now = time();
							    $hrs_step = ($right_now - $last_trackout)/(60*60);
					    $str_tabpanes .= '
					    		<td>'.round($hrs_step, 2).'</td>
					        </tr>
					  	';
					  	# Adding information about the reticle status for the lead lot
					  	if ($lot_counter == 1) {
					  		#defining new query variable AND NEW QUERY
					  		#this query will return the remaining litho layers
					  		#the first value will be the closest litho step ahead.
					  		$var_RetInfo_Step = "SELECT * FROM MI_STEP WHERE (PROCESS_ID = '".$ProcID."' AND EQP_TYPE = 'PMAINF' AND STEP_SEQ > '".oci_result($query_results, 'STEP_SEQ')."') ORDER BY STEP_SEQ ASC";
					  		$query_results_II = oci_parse($ora_conn, $var_RetInfo_Step);
							oci_execute($query_results_II);
							oci_fetch_array($query_results_II, OCI_BOTH);

							#getting next litho step seq
							$next_lihto_SS = oci_result($query_results_II, 'STEP_SEQ');
							$next_lihto_SD = oci_result($query_results_II, 'STEP_DESC');

							#clearing query vars to get reticle information
							#for some cases we will have more than 1 TIP entry for the same step. Chances are:
							# 1. Several tools are qualified to run this step but using the same reticle ID.
							# 2. We have several TIP entries but with different reticle IDs because of a revision for this mask.
							# For both cases we have to handle the results we will be showing.
							oci_free_statement($query_results_II);
							#SQL query used to be:
							// $var_RetInfo = "SELECT RETICLE_ID, RETICLE_STATUS_SEG, CUR_STATUS_SEG FROM MI_RETICLE WHERE RETICLE_ID = (SELECT RETICLE_ID FROM MI_TKIN_PREVENT WHERE PROCESS_ID = '".$ProcID."' AND STEP_SEQ = '".$next_lihto_SS."')";

							# Portion to determine if there are several TIP Entries
							# 1. Prep and execute the query to TIP Table.
							$var_RetIDs_SQL = "SELECT RETICLE_ID FROM MI_TKIN_PREVENT WHERE PROCESS_ID = '".$ProcID."' AND STEP_SEQ = '".$next_lihto_SS."'";

							$query_ret_ids_info = oci_parse($ora_conn, $var_RetIDs_SQL);
							oci_execute($query_ret_ids_info);
							# getting all elements from the query
							$num_ret_ids = array();
							while (($rows_ret_ids = oci_fetch_array($query_ret_ids_info, OCI_BOTH)) != false) {
								$num_ret_ids[] = oci_result($query_ret_ids_info, 'RETICLE_ID');
							}

							#checking number of ret IDs found
							if (count($num_ret_ids) == 1) {
								# just one ret ID found - handling code
								# saving ret id to a variable
								# getting the reticle information from MI_RETICLE Table
								$var_RetInfo = "SELECT RETICLE_ID, RETICLE_STATUS_SEG, CUR_STATUS_SEG FROM MI_RETICLE WHERE RETICLE_ID = '".$num_ret_ids[0]."'";
								# executing query
								$query_ret_info = oci_parse($ora_conn, $var_RetInfo);
								oci_execute($query_ret_info);
								oci_fetch_array($query_ret_info, OCI_BOTH);

								$str_tabpanes .= '
						  			<div class="row">
										<h4>Next Litho Step Information</h4>
										<div class="col-md-2">'.$next_lihto_SS.'</div>
										<div class="col-md-3">'.$next_lihto_SD.'</div>
										<div class="col-md-2">'.oci_result($query_ret_info, 'RETICLE_ID').'</div>
										<div class="col-md-2">'.oci_result($query_ret_info, 'RETICLE_STATUS_SEG').'</div>
										<div class="col-md-2">'.oci_result($query_ret_info, 'CUR_STATUS_SEG').'</div>
									</div>
									<br />
						  		';
							} elseif (count($num_ret_ids) > 1) {
								# more than one reticle id found or more than one TIP entry
								# we have to check if it's one case or the other by checking if the reticle ID is the same
								# first, we remove duplicates, since it's possible to have several entries with the same ret ID.
								$unique_ret_ids = array_unique($num_ret_ids);
								# counting how many unique values we have
								if (count($unique_ret_ids) == 1) {
									# means several TIP entries for the same ret ID.
									oci_free_statement($query_ret_ids_info);
									# getting the reticle information from MI_RETICLE Table
									$var_RetInfo = "SELECT RETICLE_ID, RETICLE_STATUS_SEG, CUR_STATUS_SEG FROM MI_RETICLE WHERE RETICLE_ID = '".$unique_ret_ids[0]."'";
									# executing query
									$query_ret_info = oci_parse($ora_conn, $var_RetInfo);
									oci_execute($query_ret_info);
									oci_fetch_array($query_ret_info, OCI_BOTH);

									$str_tabpanes .= '
							  			<div class="row">
											<h4>Next Litho Step Information</h4>
											<div class="col-md-2">'.$next_lihto_SS.'</div>
											<div class="col-md-3">'.$next_lihto_SD.'</div>
											<div class="col-md-2">'.oci_result($query_ret_info, 'RETICLE_ID').'</div>
											<div class="col-md-2">'.oci_result($query_ret_info, 'RETICLE_STATUS_SEG').'</div>
											<div class="col-md-2">'.oci_result($query_ret_info, 'CUR_STATUS_SEG').'</div>
										</div>
										<br />
							  		';
								} elseif (count($unique_ret_ids) > 1) {
									# means we have different reticle ids that can run at this step
									$str_tabpanes .= '
										<h4>Next Litho Step Information</h4>
									';
									foreach ($unique_ret_ids as $ret_id) {
										# making a query for each reticle ID and adding the results to the final string
										# getting the reticle information from MI_RETICLE Table
										$var_RetInfo = "SELECT RETICLE_ID, RETICLE_STATUS_SEG, CUR_STATUS_SEG FROM MI_RETICLE WHERE RETICLE_ID = '".$ret_id."'";
										# executing query
										$query_ret_info = oci_parse($ora_conn, $var_RetInfo);
										oci_execute($query_ret_info);
										oci_fetch_array($query_ret_info, OCI_BOTH);

										$str_tabpanes .= 
											'<div class="row">
												<div class="col-md-2">'.$next_lihto_SS.'</div>
												<div class="col-md-3">'.$next_lihto_SD.'</div>
												<div class="col-md-2">'.oci_result($query_ret_info, 'RETICLE_ID').'</div>
												<div class="col-md-2">'.oci_result($query_ret_info, 'RETICLE_STATUS_SEG').'</div>
												<div class="col-md-2">'.oci_result($query_ret_info, 'CUR_STATUS_SEG').'</div>
											</div>
											<br />
								  		';
									}
								}
							}
					  	}
					}
					$str_tabpanes .='
						</tbody>
						</table></div>';
				}
			}	
		}
		# Adding the closing tag </ul> to str_navtabs
		$str_navtabs .= '</ul>';
		# Adding the closing tag </div> to str_tabpanes
		$str_tabpanes .= '</div></div>';
		# concatenate Nav Tab section with Tab Panes Section
		$str_result = $str_navtabs.$str_tabpanes;
	}

	#clearing oci statement
	oci_free_statement($query_results);

	#returning values
	echo $str_result;
?>
