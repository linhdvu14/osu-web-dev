/********************************************************************************
* drawTable()
*
* Populates table body of HTML with content in dataRows.
* @param dataRows: array of database entries 
********************************************************************************/
function drawTable(dataRows) {
	var mainBody = document.getElementById("mainBody");
	mainBody.textContent = "";
	var props = ["name", "reps", "weight", "date", "lbs", "id"]; 
	
	// Add new row for each database entry
	for (var i = 0; i < dataRows.length; i++) {
		var row = document.createElement("tr");
		var dataRow = dataRows[i];
		var cell;
		
		// Add data cells	
		for (var j = 0; j < props.length - 1; j++) {
			cell = document.createElement("td");
			cell.textContent = dataRow[props[j]];
			row.appendChild(cell);
		}		
		
		// Add Delete button	
		cell = document.createElement("td");
		var delButton = document.createElement("button");
		delButton.textContent = "Delete";
		delButton.className = dataRow[props[props.length - 1]];		// className = id
		delButton.addEventListener("click", function(event){		// listen for delete event
			var req = new XMLHttpRequest();
			var payload = {id: this.className};
			req.open("POST", "/delete", true);
			req.setRequestHeader("Content-Type", "application/json");
			req.addEventListener("load", function() {
				if (req.status >= 200 && req.status < 400) {
					var response = JSON.parse(req.responseText);
					drawTable(response);
				} else {
					console.log("Error in network request: " + req.statusText);		
				}
			});
			req.send(JSON.stringify(payload));
			event.preventDefault();		
		});		
		cell.appendChild(delButton);
		row.appendChild(cell);				
						
		// Add Edit button
		cell = document.createElement("td");
		var editForm = document.createElement("form");
		editForm.method = "GET";
		editForm.action = "/edit";
		var hidden = document.createElement("input");
		hidden.type = "hidden";
		hidden.name = "id";
		hidden.value = dataRow[props[props.length - 1]];
		editForm.appendChild(hidden);
		var editButton = document.createElement("input");
		editButton.type = "submit";
		editButton.name = "Edit";
		editButton.value = "Edit";
		editForm.appendChild(editButton);
		cell.appendChild(editForm);
		row.appendChild(cell);
		
		mainBody.appendChild(row);
	}
}



/********************************************************************************
* Populate table as soon as document loads
********************************************************************************/
document.addEventListener("DOMContentLoaded", function(event) {
	var req = new XMLHttpRequest();
	req.open("GET", "/select-all", true);
	req.addEventListener("load", function() {
		if (req.status >= 200 && req.status < 400) {
			var response = JSON.parse(req.responseText);
			drawTable(response);				
		} else {
			console.log("Error in network request: " + req.statusText);
		}
	});		
	req.send(null);
});


/********************************************************************************
* Listen for addition of new exercise
********************************************************************************/
document.getElementById("addExercise").addEventListener("click", function(event) {
	var req = new XMLHttpRequest();
	var exName = document.getElementById("exName").value;
	var exReps = document.getElementById("exReps").value;
	var exWeight = document.getElementById("exWeight").value;
	var exDate = document.getElementById("exDate").value;
	var exLbs = document.getElementById("exLbs").value;
	var payload = {name: exName, reps: exReps, weight: exWeight,
					date: exDate, lbs: exLbs};
	req.open("POST", "/insert", true);
	req.setRequestHeader("Content-Type", "application/json");
	req.addEventListener("load", function() {
		if (req.status >= 200 && req.status < 400) {
			var response = JSON.parse(req.responseText);
			drawTable(response);
		} else {
			console.log("Error in network request: " + req.statusText);		
		}
	});
	req.send(JSON.stringify(payload));
	event.preventDefault();		
});



