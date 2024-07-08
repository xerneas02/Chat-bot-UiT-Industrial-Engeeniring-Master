# UiT Narvik Industrial Engineering Chatbot

This project is a chatbot designed to assist students in obtaining information about the Industrial Engineering M.Sc. program at UiT The Arctic University of Norway in Narvik. The chatbot, named H4nn4h, utilizes the OpenAI GPT-3.5 turbo API to provide responses. Depending on the launch options, the chatbot can either be integrated into the master's program web page or function as a standalone chatbot page.

## Features

- Provides information about the UiT Industrial Engineering master's program.
- Responds to queries in multiple languages based on the user's input language.
- Supports user ratings and comments on the chatbot's responses.
- Maintains a log of all interactions in a CSV file.

## Prerequisites

- Python 3.x
- Flask
- OpenAI API key

## Installation

1. Clone the repository to your local machine.
2. Ensure you have the required Python libraries installed. You can use `pip` to install them:

```bash
pip install flask openai
```

3. Set your OpenAI API key in the environment variables:

```bash
export OPENAI_API_KEY='your_openai_api_key'
```

## Usage

### Running the Chatbot

You can run the chatbot in two different modes:

1. **Standalone Chatbot Page**: This mode runs the chatbot on a standalone page.

```bash
python app.py
```

2. **Integrated Chatbot Page**: This mode integrates the chatbot into the master's program web page.

```bash
python app.py -e
```

Additionally, you can deploy the chatbot to make it accessible on the network:

```bash
python app.py --deploy
```

### Command Line Options

- `-e` or `--exemple`: Runs the chatbot integrated into the master's program web page.
- `-d` or `--deploy`: Deploys the chatbot on the network.

### Endpoints

- `/`: Serves the main HTML file.
- `/ask`: Handles POST requests for user queries and returns the chatbot's response.
- `/rate`: Handles POST requests for user ratings and comments.

### Example Commands

```bash
python app.py -e       # Runs the chatbot in integrated mode
python app.py --deploy # Deploys the chatbot
```

### Directory Structure

```
|-- static
|   |-- chatbot_profile_picture.jpg
|   |-- index.html
|   |-- script.js
|   |-- style.css
|-- uit
|   |-- chatbot_profile_picture.jpg
|   |-- index.html
|   |-- indexBlank.html
|   |-- script.js
|   |-- style.css
|-- .gitignore
|-- app.py
|-- informations.txt
```

- `static/`: Contains files for the standalone chatbot page.
- `uit/`: Contains files for the integrated chatbot page.
- `app.py`: Main Python file to run the Flask server.
- `informations.txt`: Contains information to be used by the chatbot.

## How It Works

1. **Initialization**: When the server starts, it reads the information from `informations.txt` and prepares the source knowledge.
2. **Query Handling**: When a user asks a question, the server sends the augmented prompt to the OpenAI API.
3. **Response**: The response from the API is returned to the user, and the interaction is logged in `data.csv`.
4. **Rating**: Users can rate the chatbot's responses, and these ratings are also logged.

## JavaScript Functionality

- **Chatbot Interaction**: Handles user inputs, displays messages, and fetches responses from the server.
- **Markdown to HTML Conversion**: Converts markdown in responses to HTML for display.
- **Typing Animation**: Displays a typing animation while waiting for the server's response.

## Contributing

If you wish to contribute to this project, please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.
