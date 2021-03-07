## Introduction

This project is a group exercise undertaken as part of the [University of Oxford - Artificial Intelligence: Cloud and Edge Implementations course](https://www.conted.ox.ac.uk/courses/artificial-intelligence-cloud-and-edge-implementations), as a learning challenge from Microsoft and Elephant Listening Project. The objective is to devise solutions against illegal elephant hunting in tropical African forests by enabling sensors for instant prediction of gunshot events and thus mitigate poaching attempts.

## Elephant Listening Project Challenge

As proposed by Dr. Peter Wrege, Director [Elephant Listening Project](https://elephantlisteningproject.org/), Center for Conservation Bioacoustics, Cornell Lab of Ornithology, gunshot detection is an issue in African National Parks and environmental audio data is being collected into a public database at [Congo Soundscapes](https://elephantlisteningproject.org/congo-soundscapes-public-database/) as part of the Elephant Listening Project.

> The current model (for gunshot detection) is very inefficient - less than .2% of tagged signals are gunshots and we typically get 10K- 15K tagged signals in a four-month deployment at just one of the 50 recording sites. The issue is we have about 200 good gunshots annotated, but because poaching is way too high, gunshots are still extremely rare in the sounds and it is extremely time-consuming to create the "truth" logs where we can say that every gunshot in a 24hr file has been tagged. From our understanding, this makes developing a detector more difficult.

## IoT Architecture - Microsoft Project 15 Open Platform

The [Microsoft Project 15](https://microsoft.github.io/project15/) Architecture is leveraged to follow the best practices in the deployment of scalable IoT solutions. One of the core goals of the Project 15 Open Platform is to boost innovation with a ready-made platform, allowing the scientific developer to expand into specific use cases.

![Project 15 Architecture](https://microsoft.github.io/project15/Developer-Guide/media/Architecture-Overview.png)

Data Scientists can train the model using Azure Machine Learning cloud service and deploy the model to edge devices using IoT services. This process can be automated using Azure cloud services for upgrading the edge devices models at runtime through a strategic rollout.

## Machine Learning Model Training

### Data Collection, Analysis, and Feature extraction

At this stage, we convert the gunshot detection problem statement into a machine learning problem. The main issue as per the challenge is the lack of tagged data for model training and also mostly the gunshot audio data for such use cases is proprietary. So we collected free gunshot samples and other environmental audio samples from random internet sources. A few samples of them are available in the [Sample audio](https://github.com/Oxford-ContEd/project15-elp/tree/main/Code/Sample_Audio_Data) folder. There was some basic audio cleaning done to remove noise and clip exact audio data points post converting all formats to `.wav` files into the dataset. The further audio analysis was carried out as per [Analysis Notebooks](https://github.com/Oxford-ContEd/project15-elp/tree/main/Code/Analysis) folder. For brevity, only a part of the dataset is uploaded in the repo but all examples, notebooks, and the dataset are structured in a way to accommodate more data and scale the model training process as we move ahead.

Many features were analyzed across two different classes namely gunshot and environmental audio. The environmental audio contains audio data of elephant noises and other sounds of the tropical African forests. The features analyzed are as follows,

- Spectral Centroid
- 13 MFCCs
- Zero-Crossing Rate
- Onset Detection Frequency

There could be more features relevant to this classification problem that can be analyzed to improve the model in the future and for the scope of this exercise the first thirteen Mel-Frequency Cepstral Coefficients suited best as input features for audio classification.

### Classification Model Architecture

The input to the machine learning model will be a set of audio features and the model has to classify each input set into two classes, i.e gunshot or environmental audio. This is a binary classification problem and a suitable [Dataset](https://github.com/Oxford-ContEd/project15-elp/tree/main/Code/Dataset) was created for training purposes. A [feature extraction script](https://github.com/Oxford-ContEd/project15-elp/tree/main/Code/Model_Training/feature_extraction.py) was created to convert the raw audio `.wav` files into relevant feature data and corresponding true values for classification.

[Azure Machine Learning](https://azure.microsoft.com/en-in/services/machine-learning/) cloud service has been leveraged for the classification model supervised training. In this case, two different model architectures were tested by running scripts from the [Makefle](https://github.com/Oxford-ContEd/project15-elp/tree/main/Code/Model_Training/Makefile) and the following results were observed,

| Neural Network Architecture  | Train Accuracy | Test Accuracy |
| ---------------------------- | -------------- | ------------- |
| Multi-layer Perceptron       | 0.9756         | 0.9405        |
| Convolutional Neural Network | 0.9740         | 0.9236        |

_Note_: These accuracy metrics depend directly on the limited data used for model training and testing. Further improvements in contextual data collection, feature extraction and analysis, and experimentation with model architectures is needed to validate the reliability of these model metrics for practical applications.

## IoT Solution Deployment

### Event processing for Gunshot detection

- Edge devices continuously read audio data, extracts features, and makes ML inference to classify events as gunshot or not.

- Edge devices at multiple locations in the National park then, sends this telemetry data to Event Hub through the IoT gateway

- If an alert is required to be sent then it will be sent to Azure Notifications Hub

- We could also write the events to a structured database for long-term persistence and audit purposes later.

- Azure apps or Power BI monitoring dashboard reads and displays live telemetry data from multiple sensors at different locations.

- Rangers can monitor the notifications and live dashboard for threats.

### Microsoft Project 15 Setup

- Deploy the Project 15 platform as per instructions [here](https://microsoft.github.io/project15/Deploy/Deployment.html). The scalable nature of this architecture can be utilized to add further components for streaming and batch processing later as needed.

![architecture](https://user-images.githubusercontent.com/24502613/110241418-a372a480-7f76-11eb-8bd5-8e26f3563120.png)

- Add a device called `gunshot-detector-1` as per the instructions [here](https://microsoft.github.io/project15/Deploy/ConnectingDevice.html)

### Edge Device Simulation

The models can be deployed using [NVIDIA Triton Inference Server](https://developer.nvidia.com/nvidia-triton-inference-server) and a deployment [notebook](https://github.com/Oxford-ContEd/project15-elp/tree/main/Code/Deployment/deploy.ipynb) demonstrates the best approach to a cloud-native inference setup using container technology and inference over network.

For demo purposes, we have created an edge device prototype that simulates predictions from audio data and sends telemetry data to IoT Hub. This is a `nodejs` based application that uses `tensorflow` as backend to make predictions using the model created during training phase.

The model created during the training phase needs conversion to a tensroflow js graph model format to be used in a node js application. So we convert the models to `tfjs` graph format for the client to predict using the make command as follows

```sh
make convert_model
```

Register an edge device named `gunshot-detector-1` to IoT Hub and copy IoT device connection string from the micorsoft portal into `.env` file in the [edge device source folder](https://github.com/Oxford-ContEd/project15-elp/tree/main/Code/Deployment/Client) as follows

```
CONN_STR=<conn-string>
DETECTOR_ID=gunshot-detector-1
```

Now, run the edge device prototype to simulate gunshot predictions randomly and send telemetry data to IoT Hub

```sh
make run_device_simulation
```

### Live Monitoring and Demo

- [Demo Video](https://user-images.githubusercontent.com/24502613/110214101-04dc3a00-7ec9-11eb-901c-99a3de0b2352.mp4)

- Monitor gunshot detection from the Project 15 app
  ![gunshot_telemetry](https://user-images.githubusercontent.com/24502613/110213015-369ed200-7ec4-11eb-9788-9f3ac3b99184.png)

## Future Work

Gunshot detection is still an unsolved problem today and there is ongoing research on this front for both military and other purposes around the world. The machine learning classification model in this context can be improved with **better data collection** from the tropical forests in Africa. The **lack of sufficient data** remains the major issue with this challenge. Accurate gunshot audio should be recorded using the **apposite set of hunting rifles** for improved accuracy and further feature analysis can be conducted comparing gunshots with other surrounding sounds in the elephant habitat.

Further, many more model architectures can be tested and compared to understand what hyper-parameters work best for such remote environments. This can surely improve the model training process. Also, better deployment practices, telemetry, alert systems, and model upgrade processes can be explored with cloud-based IoT solutions to improve the overall efficiency of the solution.

### Relevant Links

- [Elephant Listening Project](https://elephantlisteningproject.org/)
- [Microsoft Project 15](https://microsoft.github.io/project15/)
- [Update Presentation Slides](./Project_15_ELP_Slides.pptx)
- [Sample Datasets](https://www.paperswithcode.com/datasets?q=gunshot&v=lst&o=match)
- [ML Classification Guide](https://developers.google.com/machine-learning/guides/text-classification/)

## Team

### University of Oxford - Artificial Intelligence: Cloud and Edge Implementations - Team 3

- Sachin Varghese
- Prasad Deshpande
- Loc Nguyen
- Eden Bodkin
- Kennedy. Mumba
- Ashwin Mylavarapu
- Menelaos Malaxianakis
