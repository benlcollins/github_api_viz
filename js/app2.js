$(document).ready(function(){

	$("#search").click(function(){

		// find out the searchterm
		var searchterm = $("#term").val() ? $("#term").val() : "benlcollins";

		// get user
		function getUserData(callback) {
			$.get("https://api.github.com/users/" + searchterm, 
				function(data, status){
					console.log(status);
					success: callback(data, status);
			});
		};

		// get repos
		function getUserRepos(callback){
			$.get("https://api.github.com/users/" + searchterm + "/repos", 
				function(data, status){
					console.log(status);
					success: callback(data,status);
			});
		};

		// get languages
		function getRepoLanguages(callback,repo){
			$.get("https://api.github.com/repos/" + searchterm + "/" + repo + "/languages", 
				function(data, status){
						console.log(status);
						success: callback(data,status);
			});
		};

		// callback function to display user
		function showUser(data, status){
		    console.log(status);
		    var username = "<h3>" + data.login + "</h3>";
		    $("#username").append(username);
		    // debugger;
		};

		// callback function to show repos
		function showRepos(data, status){
			console.log(status);
			for (var i = 0; i < data.length; i++) {
				$("#repoDetails").append("<li id='repo" + i + "'>" + data[i].name + "</li>");
			};

			// click event on repo choices
			$("#repoDetails").children().click(function(){
				
				// clear out any prior details
				$("#langDetails").children().remove();

				// get the chosen repo id by reference to the id of the element in list that was clicked
				var repoChoice = $("#"+this.id).html();
				getRepoLanguages(showLangs, repoChoice);

			});
		};

		// callback function to show languages
		function showLangs(data, status){

			
			
			console.log(status);
			console.log(data);

			// loop through data object and append items to li
			for (var key in data) {
  			if (data.hasOwnProperty(key)) {
  				$("#langDetails").append("<li>" + key + ": " + data[key] + "</li>");
  			};
  		};

		};

		// call the functions
		// getUserData(showUser);
		getUserRepos(showRepos);

	}); // end of search click function


}); // end of document ready




























