import json
import numpy as np
from sklearn.model_selection import train_test_split
import tensorflow.keras as keras
import os
# path to json file that stores MFCCs and genre labels for each processed segment

dirname, filename = os.path.split(os.path.abspath(__file__))
DATA_PATH = os.path.join(dirname, "test_dataset.json")
MODEL_PATH = os.path.join(dirname, 'models/gunshot-detection/1/model.savedmodel')

def load_data(data_path):
    """Loads training dataset from json file.

        :param data_path (str): Path to json file containing data
        :return X (ndarray): Inputs
        :return y (ndarray): Targets
    """

    with open(data_path, "r") as fp:
        data = json.load(fp)

    # convert lists to numpy arrays
    X = np.array(data["mfcc"])
    y = np.array(data["labels"])

    print("Data succesfully loaded!")
    return X, y

def predict(model, X, y):
    """Predict a single sample using the trained model

    :param model: Trained classifier
    :param X: Input data
    :param y (int): Target
    """

    # add a dimension to input data for sample - model.predict() expects a 4d array in this case
    X = X[np.newaxis, ...]  # array shape (1, 10, 13, 1)
    
    # perform prediction
    prediction = model.predict(X)
    
    # get index with max value
    predicted_index = np.argmax(prediction, axis=1)[0]

    print("Target Label: {}, Predicted label: {}".format(y, predicted_index))


if __name__ == "__main__":

    # load data
    X, y = load_data(DATA_PATH)

    # create train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.8)

    # add an axis to input sets for CNN
    # X_train = X_train[..., np.newaxis]
    # X_test = X_test[..., np.newaxis]

    model = keras.models.load_model(MODEL_PATH)

    # Check its architecture
    model.summary()

    # evaluate model on test set
    test_loss, test_acc = model.evaluate(X_test, y_test, verbose=2)
    print('\nTest accuracy:', test_acc)

    # pick a sample to predict from the test set
    X_to_predict = X_test[3]
    y_to_predict = y_test[3]
    
    # predict sample
    predict(model, X_to_predict, y_to_predict)
