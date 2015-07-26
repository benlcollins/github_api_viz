$(document).ready(function(){
	
	// execute when user clicks on search button
	$("#search").click(function(){

		// find out the searchterm
		var searchterm = $("#term").val() ? $("#term").val() : "github";

		// get user
		function getUserData(callback) {
			$.get("https://api.github.com/users/" + searchterm, 
				function(data, status){
					console.log(status);
					success: callback(data, status);
			});
		};

		// callback function to show user
		function showUser(data, status){
		    console.log(status);
		    var username = "<h3>" + data.login + "</h3>";
		    $("#username").append(username);
		    // debugger;
		};

		// call the user and repos functions
		getUserData(showUser);

	});
});