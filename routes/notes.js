//add trello module
var Trello = require("node-trello");
var fs = require('fs');

// ***************************
//handle request for home page
// ***************************
exports.home = function (req, res) {
    //'home' is the name of the view
    res.render('home', {title: 'Release Notes Generator'})
};

// ***************************
//handle request for list page
// ***************************
exports.chooselist = function (req, res) {
    var api = new Trello(req.body.KeyId, req.body.TokenId);
    api.get('/1/boards/' + req.body.BoardId + '/lists', function (err, data) {
        if (err) throw err;

        res.render('lists', {
            title: 'Release Notes Generator',
            lists: data,
            keyid: req.body.KeyId,
            tokenid: req.body.TokenId
        })
    });

};

// ***************************
//handle request for rel notes page
// ***************************
exports.generatenotes_backup = function (req, res) {
    var api = new Trello(req.body.KeyId, req.body.TokenId);
    api.get('/1/lists/' + req.body.ListId + '/cards', function (err, data) {
        if (err) throw err;

        //no grouping requested, so return all cards
        if (req.body.GroupingCheck == 'No') {
            res.render('releasenotes', {
                title: 'Release Notes Generator',
                cards: data,
                isGrouped: 'No'
            })

        }
        else {
            //variables used for filtered groups
            var featureColor = req.body.FeatureColor;
            var fixColor = req.body.FixesColor;
            var features = new Array();
            var fixes = new Array();
            var featureCount = 0;
            var fixCount = 0;

            //loop through all cards
            for (var i = 0, j = data.length; i < j; i++) {
                var card = data[i];

                //look for feature cards and add to array
                if (card.labels[0] != null && card.labels[0].color == featureColor) {
                    features[featureCount] = card;
                    featureCount++;
                }
                //look for fix cards and add to array
                else if (card.labels[0] != null && data[i].labels[0].color == fixColor) {
                    fixes[fixCount] = data[i];
                    fixCount++;
                }
            }

            //return both arrays of cards
            res.render('releasenotes', {
                title: 'Release Notes Generator',
                featurecards: features,
                fixcards: fixes,
                isGrouped: 'Yes'
            })
        }

    });
};

exports.generatenotes = function (req, res) {

    var api = new Trello(req.body.KeyId, req.body.TokenId);
    api.get('/1/lists/' + req.body.ListId + '/cards', function (err, data) {

        var card, date, transfer, recipient, title, number, type, description, hours, comments, csv, header;


        if (err) {
            throw err;
        }

        csv = fs.createWriteStream(__dirname + "/files/decompte.csv");
        header = 'date,mode tranfert,destinataire,titre,nombre,type,description,heures,commentaires' + '\n';

        csv.write(header);

        //loop through all cards
        for (var i = 0, j = data.length; i < j; i++) {


            card = data[i];

            var my_data = extract_line(
                card.desc,
                '------------------------------ debut ----------------------------',
                '------------------------------ fin --------------------------------'
            );

            console.log(my_data);

            date = extract_line(my_data, 'date ok: ', '\n');
            transfer = extract_line(my_data, 'mode de transfert: ', '\n');
            recipient = extract_line(my_data, 'destinataire: ', '\n');
            title = extract_line(my_data, 'titre: ', '\n');
            number = extract_line(my_data, 'nombre: ', '\n');
            type = extract_line(my_data, 'type: ', '\n');
            description = extract_line(my_data, 'description: ', '\n');
            hours = extract_line(my_data, 'heures: ', '\n');
            comments = extract_line(my_data, 'commentaires: ', '\n');

            var row = date + ',' + transfer + ',' + recipient + ',' + title + ',' + number + ','
                + type + ',' + description + ',' + hours + ',' + comments + '\n';

            csv.write(row);

        }

        csv.end();

        csv.on('close', function() {
            res.download(csv.path);
        });

    });
};




function extract_line (string, begin_str, end_str) {

    var str, begin, end;

    begin = string.indexOf(begin_str);
    str = string.substring(begin + begin_str.length);

    end = str.indexOf(end_str);
    str = str.substring(0, end);

    return str;

}