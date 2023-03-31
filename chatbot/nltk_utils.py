import nltk
nltk.download('punkt');
from nltk.stem.porter import PorterStemmer
import numpy as np
stemmer = PorterStemmer();
def tokenize(sentence):
    return nltk.word_tokenize(sentence)

def stem(word):
    return stemmer.stem(word.lower())

def bag_of_words(tokenized_sentence,all_words):
    tokenized_sentence = [stem(w) for w in tokenized_sentence]
    bag = np.zeros(len(all_words), dtype=np.float32)
    for idx, w in enumerate(all_words):
        if w in tokenized_sentence:
            bag[idx] = 1.0
    return bag

# sentence = ['hello', 'how', 'are', 'you']
# words = ['hi', 'hello', 'I', 'you', 'bye', 'cool', 'thank']
# bag = bag_of_words(sentence,words)
# print(bag)
# a = "Tell me about andaman and nicobar islands?"
# print(a)
# a = tokenize(a)
# print(a)
# words = ['organizer','organization','organize']
# st_words = [stem(w) for w in words]
# print(st_words) 
