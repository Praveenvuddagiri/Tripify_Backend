const { NlpManager } = require('pv-node-nlp');
const fs = require('fs');
const path = require('path');

const manager = new NlpManager({ languages: ['en'], nlu: { useNoneFeature: false }, nlu: { log: true } });


const trainChatBot = async() => {
    const dir = path.dirname(require.main.filename);
    const datasetPath = path.join(dir, '/utils/dataset.json');
    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8')).dataset;

    // Iterate through the dataset and add documents and answers to the NlpManager
    dataset.forEach(data => {

        data.patterns.forEach(pattern => {
            manager.addDocument('en', pattern, data.tag);
        });
        data.responses.forEach(response => {
            manager.addAnswer('en', data.tag, response);
        });
    });

    //train and save the model
    await manager.train();
    await manager.save();

}

const askChatBot = async (question) => {
    const dir = path.dirname(require.main.filename);
    const datasetPath = path.join(dir, 'model.nlp');
    await manager.load(datasetPath);
    let response = await manager.process('en', question);
    response = JSON.parse(JSON.stringify(response));
    return response.answer;
}


module.exports = {askChatBot, trainChatBot};