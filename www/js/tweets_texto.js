function loadTweets(){
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", "/tweets", true);
	xhttp.send();

	xhttp.onreadystatechange = function () {
		  //if (xhttp.readyState == 4 && xhttp.status == 200) {
		      var tweets = JSON.parse(xhttp.responseText)
					console.log(tweets)
					 $('#tweets_box').bootstrapTable({
				columns: [{
								field: 'texto',
								title: 'Tweets'
						}, {
								field: 'creadoen',
								title: 'Fecha'
						}],
							data:tweets,
				height: 450,
        pagination: true,
        pageSize : 30,
        classes: 'table'
						})
		  /*} else {
		      console.log('Problema en server')
		  }*/
	}

}
