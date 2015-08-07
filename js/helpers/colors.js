
var stringToHex = function(string) {
	var hex = '#000000';
	
	switch(string) {
		case 'red' : hex = '#FF0000'; break;
		case 'green' : hex = '#00FF00'; break;
		case 'blue' : hex = '#0000FF'; break;
	}
	
	return hex;
}