import random
import json
import torch
from model import NeuralNet
from nltk_utils import tokenize,stem,bag_of_words
import os
from pathlib import Path
import sys


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
with open(os.path.join(Path(__file__).resolve().parent, "dataset.json"),'r') as f:
    dataset = json.load(f)

FILE = os.path.join(Path(__file__).resolve().parent, "data.txt")
data = torch.load(FILE)

input_size = data['input_size']
hidden_size = data['hidden_size']
output_size = data['output_size']
all_words = data['all_words']
tags = data['tags']
model_state = data['model_state']

model = NeuralNet(input_size,hidden_size,output_size).to(device)
model.load_state_dict(model_state)
model.eval()

bot_name = "BOT"
# print("Let's chat! type 'exit' to quit")

def get_response(msg):
    sentence = tokenize(msg)
    x = bag_of_words(sentence,all_words)
    x = x.reshape(1, x.shape[0])
    x = torch.from_numpy(x).to(device)

    output = model(x)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]

    probs = torch.softmax(output,dim=1)
    prob = probs[0][predicted.item()]

    if prob.item() > 0.85:
        for data in dataset['dataset']:
            
            if tag == data['tag']:
                return (random.choice(data["responses"]))
    else: 
        return (" I do not understand!!!")

if __name__ == "__main__":
    # print("Let's chat! (type 'quit' to exit)")
    # while True:
    #     sentence = input("You: ")
    #     if sentence == "quit":
    #         break

    #     resp = get_response(sentence)
    #     print(resp)

    # Get the function name and parameter from command-line arguments
    functionName = sys.argv[1]
    parameter = sys.argv[2]

    # Call the specified function with the parameter and print the result
    if functionName == 'my_function':
        result = get_response(parameter)
        print(result) #temp
