/**
 * @author Bastien Eichenberger
 */

function GenerateTokenUrl() {

    var key= data.key;
    var link = 'https://trello.com/1/authorize?key='+ key +'&name=Release+Notes+Generator&expiration=never&response_type=token';
    window.open(link);

}
