//declaring variable to make reference to the new window created
var chkWind = null;
//Reticle by Lead Lot -- CTA Slidetoggle Flag
var retllcta_flag = false;

//--------------login section .js-------------------
function log_acc_request(inputName, inputEmail, selectDpt, txtareaPurpose){
	//start with data validation from the account request form
	var form_val_flag = false;
	var regex_name = /^[a-zA-Z ]{2,30}$/;
	var regex_email = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;
	var var_req_name = document.getElementById(inputName).value;
	var var_req_email = document.getElementById(inputEmail).value;
	var var_req_dpt = document.getElementById(selectDpt).value;
	var var_req_purpose = document.getElementById(txtareaPurpose).value;

	//checking no value is empty
	if (var_req_name == "" || var_req_email == "" || var_req_dpt == "" || var_req_purpose == "") {
		//trigger/show alert div on modal window
		$('#log_long_text').html("<strong>Oh, Almost there!</strong> First, complete all fields required below :)");
		// $('#log_long_text').text("Oh Almost there! First, complete all fields required below :)");
		$("#log_notifier_div").addClass("alert-danger");
		$('#log_notifier_div').slideToggle(500);
		setTimeout(function () {
			// body...
			$('#log_notifier_div').slideToggle(500);
		},5000);
	}
	else if(!var_req_name.match(regex_name)){
		//trigger/show alert div on modal window -> validating name
		$('#log_long_text').html("<strong>Misspelling?</strong> Would you mind to check your name?");
		// $('#log_long_text').text("Oh Almost there! First, complete all fields required below :)");
		$("#log_notifier_div").addClass("alert-danger");
		$('#log_notifier_div').slideToggle(500);
		setTimeout(function () {
			// body...
			$('#log_notifier_div').slideToggle(500);
		},5000);
	}
	else if(!var_req_email.match(regex_email)){
		//trigger/show alert div on modal window -> validating email address
		$('#log_long_text').html("<strong>Is that your email address?</strong> Would you mind check again?");
		// $('#log_long_text').text("Oh Almost there! First, complete all fields required below :)");
		$("#log_notifier_div").addClass("alert-danger");
		$('#log_notifier_div').slideToggle(500);
		setTimeout(function () {
			// body...
			$('#log_notifier_div').slideToggle(500);
		},5000);
	}
	else{
		//calling ajax to process request and send email to administrator.
		var functionData = {
            "req_name"	 	: var_req_name,
            "req_email"	 	: var_req_email,
            "req_dept"	 	: var_req_dpt,
            "req_purpose"	: var_req_purpose
    	};
    	$.ajax({
            data:  functionData,
            url:   '../app/acc_request_proc.php',
            type:  'post',
            beforeSend: function () {
            },
            success: function (response) {
            	//checking value of error_flag
            	alert(response);
            	if (response == 0) {
	            	$("#log_long_text").html("<strong>All set!</strong> The System Administrator will contact you soon.");
	            	$("#log_notifier_div").addClass("alert-success");
					$("#log_notifier_div").slideToggle(500);
					setTimeout(function () {
						// body...
					$('#log_notifier_div').slideToggle(500);
					},5000);
            	}
            }
    	});
	}
	return false;  //this is just to avoid the modal window closing
}
function TogglingAlertDiv_AccReq(inputName, inputEmail, selectDpt, txtareaPurpose) {

	var var_req_name = document.getElementById(inputName).value;
	var var_req_email = document.getElementById(inputEmail).value;
	var var_req_dpt = document.getElementById(selectDpt).value;
	var var_req_purpose = document.getElementById(txtareaPurpose).value;

	//checking no value is empty
	if (var_req_name == "" || var_req_email == "" || var_req_dpt == "" || var_req_purpose == "") {
		//trigger/show alert div on modal window
		$('#log_long_text').html("<strong>Oh, Almost there!</strong> First, complete all fields required below :)");
		// $('#log_long_text').text("Oh Almost there! First, complete all fields required below :)");
		$("#log_notifier_div").addClass("alert-danger");
		$('#log_notifier_div').slideToggle(500);
		setTimeout(function () {
			// body...
			$('#log_notifier_div').slideToggle(500);
		},5000);
	}
}
//--------------login section .js-------------------


function plc_LotID_Validation (input_LotID) {
	// body...
	var lotidval_flag = false;
	var var_LotID = document.getElementById(input_LotID).value;
	var regex = /^[a-zA-Z0-9]+(\.{1}[a-zA-Z0-9]+)?$/;
	if (var_LotID == "") {
		lotidval_flag = true;
		$('#mynotifier_modal').text("Oooppss! LotID field is empty");
		$('#plc_long_text').text("Please check Lot ID input field. A Lot ID value must be entered.");
		$('#notifier_modal').modal('show');
	}
	else if (var_LotID !== "") {
		if (var_LotID.length < 7) {
			$('#mynotifier_modal').text("Oooppss! LotID doesn't meet criteria");
			$('#plc_long_text').text("Please check the Lot ID you have entered, looks like you are missing something...");
			$('#notifier_modal').modal('show')
		}
		else if(!var_LotID.match(regex)){
			$('#mynotifier_modal').text("Oooppss! LotID doesn't meet criteria");
			$('#plc_long_text').text("Please check the Lot ID you have entered, looks like you are missing something...");
			$('#notifier_modal').modal('show')
		}
		else{
			var functionData = {
                "lot_ID"	 : var_LotID
        	};
        	$.ajax({
                data:  functionData,
                url:   'plc_ajax_add.php',
                type:  'post',
                beforeSend: function () {
                },
                success: function (response) {
                	$('#mynotifier_modal').text("Done! New Lot Added");
					$('#plc_long_text').text("Information added. New Lot ID: "+var_LotID);
					$('#notifier_modal').modal('show');
                	$('.results_container').html(response);
                }
        	});
		}
	}
}

//function to load/refresh load list/information
function plc_LotID_Refresh () {
	// using jquery/ajax to call php function
	//alert('refreshing');
	$.ajax({
        url:   'plc_ajax_refresh.php',
        type:  'post',
        beforeSend: function () {
        },
        success: function (response) {
        	$('.results_container').html(response);
        }
	});
}
setInterval(plc_LotID_Refresh, 1000 * 60); //refreshing content every minute

//function to delete a lot from the list
function plc_LotID_Delete (lot_id) {
	// using jquery/ajax to call php function

	var functionData = {
        "lot_ID"	 : lot_id
    };
	$.ajax({
		data:  functionData,
        url:   'plc_ajax_delete.php',
        type:  'post',
        beforeSend: function () {
        },
        success: function (response) {
        	$('#mynotifier_modal').text("Done! Lot Deleted");
			$('#plc_long_text').text("Lot ID "+lot_id+" has been removed from our local Database.");
			$('#notifier_modal').modal('show');
        	$('.results_container').html(response);
        }
	});
}

//function to load/refresh load list/information
function plc_AutoChecker () {
	// using jquery/ajax to call php function
	$.ajax({
        url:   'plc_ajax_autochecker.php',
        type:  'post',
        beforeSend: function () {
        },
        success: function (response) {
        	//$('.results_container').html(response);
        	if (response != 0) {
        		if (chkWind && !chkWind.closed)
        		{
        			alert('Please check the Hot Lots waiting more that 3 hrs');
        			chkWind.focus();
        		}
        		else{
        			var html_content = "<head><link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css\"><style>.table{font-size: 14px;!important}</style></head><h4>The following lot(s) are waiting/holding over 3 hrs. Please proceed to check them.</h4><br/>"+response;

		        	var width = 800;
				    var height = 300;
				    var left = parseInt((screen.availWidth/2) - (width/2));
				    var top = parseInt((screen.availHeight/2) - (height/2));
				    var windowFeatures = "width=" + width + ",height=" + height + ",status,resizable,left=" + left + ",top=" + top + "screenX=" + left + ",screenY=" + top;
		        	chkWind = window.open("", "", windowFeatures);
				    chkWind.document.write(html_content);
				    chkWind.focus();
        		}
        	}
        }
	});
}
setInterval(plc_AutoChecker, 1000*60*60); //refreshing content every hour


//-------------  Reticle per lead lot section -------------------------
function Reticle_CTA_SlideToggle(inputDevice){
	var ret_input_value = document.getElementById(inputDevice).value;
	//removing blank spaces in the string
	ret_input_value = ret_input_value.replace(/ /g,'');
	//replacing string in input box
	document.getElementById(inputDevice).value = ret_input_value.toUpperCase();
	//SlideToggle effect for CTAs
	if (ret_input_value != "" && retllcta_flag == false) {
		retllcta_flag = true;
		$('#retll_ctas').slideToggle(500); //showing ctas
	} else if(ret_input_value == "" && retllcta_flag == true){
		retllcta_flag = false;
		$('#retll_ctas').slideToggle(500); //hiding ctas
	}
}

function Reticle_LeadLot_Search(inputDevice){
	var ret_input_value = document.getElementById(inputDevice).value;
	//checking last char of string -- removing if a comma
	if (ret_input_value.slice(-1) == ",") {
		ret_input_value = ret_input_value.substring(0, ret_input_value.length - 1);
		//removing last char if a comma
		document.getElementById(inputDevice).value = ret_input_value.toUpperCase();
	}

	var functionData = {"proc_IDs" : ret_input_value};
	$.ajax({
		data:  functionData,
    url:   'retll_ajax_finder.php',
    type:  'post',
    beforeSend: function () {
      //calling modal with progress bar
    	$('#mod_retll_finder').modal({
    		backdrop: 'static',
	  		keyboard: false
			});
      $('#mod_retll_finder').modal('show');
    },
    success: function (response) {
    	$('#mod_retll_finder').modal('hide');
    	$('#retll_tabs_div').html(response);
    	// alert(response);
    }
	});
}

function Reticle_ProcID_Search(inputDevice){
	var ret_input_value = document.getElementById(inputDevice).value;
	//checking last char of string -- removing if a comma
	if (ret_input_value.slice(-1) == ",") {
		ret_input_value = ret_input_value.substring(0, ret_input_value.length - 1);
		//removing last char if a comma
		document.getElementById(inputDevice).value = ret_input_value.toUpperCase();
	}

	var functionData = { "proc_IDs"	: ret_input_value };
	$.ajax({
		data:  functionData,
        url:   'retpid_ajax_finder.php',
        type:  'post',
        beforeSend: function () {
        //calling modal with progress bar
        	$('#mod_retpid_finder').modal({
        		backdrop: 'static',
			  	keyboard: false
			});
        	$('#mod_retpid_finder').modal('show');
        },
        success: function (response) {
        	$('#mod_retpid_finder').modal('hide');
        	$('#retpid_tabs_div').html(response);
        	// alert(response);
        }
	});
}

//clearing cookie when Clear button is pressed.
var Delete_Cookie = function(name, form_input) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.getElementById(form_input).value = "";
	$('#retll_ctas').slideToggle(500); //hiding ctas
    retllcta_flag = false;
};
