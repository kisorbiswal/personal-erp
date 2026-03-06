---
source: mylogger
mylogger_id: 566
created: 2011-12-27T10:07:32+00:00
created_raw: 2011-12-27 10:07:32
completed_raw: 
tags:
  - js
---

Validation of table and dropdown function validateTables( ) {n	var isSuccess=true;n	$j(".mustHaveRow").each(function(){n		var $this = $j(this);n		n		var $divError = $this.find("div.errorTable");n		if($divError.length==1){n		$divError.remove();n		}n		var rows= $this[0].rows;n		if(rows.length<2){n			isSuccess=false;n			$j("<div/>").addClass("errorTable").text("Must have atleast one row.").appendTo($this.find("tr:first").find("th:first")).click(function(){$j(this).hide();});n		}n	});nn	return isSuccess;n}nnfunction validateDropdowns( ) {n	var isSuccess=true;n	$j(".mustSelect").each(function(){n		var $this = $j(this);n		n		var $divError = $this.parent().find("div.errorTable");n		if($divError.length==1){n		$divError.remove();n		}n		var selectedVal= $this.val();n		if(selectedVal=="empty"){n			isSuccess=false;n			$j("<div/>").addClass("errorTable").text("Must select one option.").appendTo($this.parent()).click(function(){$j(this).hide();});n		}n	});nn	return isSuccess;n}
