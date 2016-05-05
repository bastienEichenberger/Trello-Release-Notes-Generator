//add trello module
var Trello = require("node-trello");
var fs = require('fs');
var config = require('../config.js');

exports.home = function (req, res) {

    res.render('home', {
            data: {
                title: config.title,
                boards: config.boards,
                key: config.key
            }
        }
    );

};

exports.chooselist = function (req, res) {

    var api = new Trello(config.key, req.body.token);

    api.get('/1/boards/' + req.body.board + '/lists', function (err, data) {

        if (err) {
            throw err;
        }

        res.render('lists', {
            data: {
                title: 'Release Notes Generator',
                lists: data,
                keyid: config.key,
                tokenid: req.body.token
            }
        })
    });

};

exports.generate_report = function (req, res) {

    var api = new Trello(req.body.KeyId, req.body.TokenId);
    api.get('/1/lists/' + req.body.ListId + '/cards', function (err, data) {

        var card, my_data, date, transfer, recipient, title, number, type, description, hours, comments, csv, header;


        if (err) {
            throw err;
        }

        csv = fs.createWriteStream(__dirname + "/files/decompte.csv");
        header = 'date,mode tranfert,destinataire,titre,nombre,type,description,heures,commentaires' + '\n';

        csv.write(header);

        //loop through all cards
        for (var i = 0, j = data.length; i < j; i++) {

            card = data[i];

            // get the data between debut and fin
            my_data = extract_line(
                card.desc,
                '------------------------------ debut ----------------------------',
                '------------------------------ fin --------------------------------'
            );

            // extract data after title ex date ok: 10.02.2016
            date = extract_line(my_data, 'date ok: ', '\n');
            transfer = extract_line(my_data, 'mode de transfert: ', '\n');
            recipient = extract_line(my_data, 'destinataire: ', '\n');
            title = extract_line(my_data, 'titre: ', '\n');
            number = extract_line(my_data, 'nombre: ', '\n');
            type = extract_line(my_data, 'type: ', '\n');
            description = extract_line(my_data, 'description: ', '\n');
            hours = extract_line(my_data, 'heures: ', '\n');
            comments = extract_line(my_data, 'commentaires: ', '\n');

            // create a csv line
            var row = date + ',' + transfer + ',' + recipient + ',' + title + ',' + number + ','
                + type + ',' + description + ',' + hours + ',' + comments + '\n';

            csv.write(row);

        }

        csv.end();

        // events listeners
        csv.on('close', function () {
            res.download(csv.path);
        });

    });
};


/**
 *
 * @param string
 * @param begin_str
 * @param end_str
 * @return {string}
 */
function extract_line (string, begin_str, end_str) {

    var str, begin, end;

    begin = string.indexOf(begin_str);
    str = string.substring(begin + begin_str.length);

    end = str.indexOf(end_str);
    str = str.substring(0, end);

    return str;

}