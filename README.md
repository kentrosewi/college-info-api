# College Info API

This API allows you to search a "database" (actually a CSV) for a given college. It will calculate the cost of tuition (with option of not including room and board).

To run this application, visit my live example hosted on Heroku: https://college-info-api.herokuapp.com/. Parameters accepted are 'name', 'includeRoomAndBoard', and 'exactMatch'. Since I am using Heroku's free service, the app may take a few seconds longer to load initially if being "woken up" (if it hasn't been used in 30 minutes).

Example: https://college-info-api.herokuapp.com/api/college?name=adelph&includeRoomAndBoard=false&exactMatch=false

Built in NodeJS w/ Express for the back-end.
