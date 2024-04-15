from flask import Flask, request, jsonify
from langchain_openai import ChatOpenAI
from langchain.schema import (
    SystemMessage,
    HumanMessage,
    AIMessage,
)
import os
from datetime import datetime
import sys
from threading import Lock

lock = Lock()


deploy = False

if len(sys.argv) >= 2:
    deploy = ("-d" in sys.argv or "--deploy" in sys.argv)

today = datetime.today().strftime('%Y-%m-%d')

if not os.path.exists("data.csv"):
    with open("data.csv", "w") as file:
        file.write("Question;Answer;Rating;Comment\n")

app = Flask(__name__, static_folder='static')

chat = ChatOpenAI(
    openai_api_key= os.environ.get("OPENAI_API_KEY"),
    model="gpt-3.5-turbo"
)

informations_txt = open("informations.txt", "r")
informations = informations_txt.read()
informations_txt.close()

informations = informations.split("$$\n")
informations.append(f"\nToday date : {today}")

source_knowledge = "||".join(informations)

messages = []
prompt_answer = {"prompt":"","answer":""}

@app.route("/")
def index():
    """Serve the main HTML file"""
    return app.send_static_file("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    global prompt_answer
    global messages
    
    query = request.json["query"]
    prompt_answer["prompt"] = query

    augmented_prompt = f"""You are a chatbot named H4nn4h (devloped by Mathis Roubille) here to assist students in obtaining information about the UiT The Arctic University of Norway in Narvik, particularly regarding the Industrial Engineering M.Sc. program in Narvik. If the query is in a different language, as there are students from abroad, try to respond in their language. If the query is completely off-topic, please indicate so, but you can answer some questions if they are about Narvik, life there, or related topics not directly connected to the master's degree. Please keep responses brief and to the point if possible and try providing links when available (the interface doesn't handle markdown).

    Contexts:
    {source_knowledge}

    Query: {query}"""


    # Create new user prompt
    prompt = HumanMessage(content=augmented_prompt)
    messages.append(prompt)

    # Send to OpenAI
    res = chat.invoke(messages)
    
    messages = []
    messages.append(res)

    prompt_answer["answer"] = res.content
    # Return response in JSON format
    return jsonify({"content": res.content}) 

@app.route("/rate", methods=["POST"])
def rate():
    global prompt_answer
    rating = request.json["rating"]
    comment = request.json.get("comment", "")
    comment = comment.replace("\n", " ")
    prompt_answer['prompt'] = prompt_answer['prompt'].replace(';', ',').replace('\n', ' ')
    prompt_answer['answer'] = prompt_answer['answer'].replace(';', ',').replace('\n', ' ')
    
    with lock:
        with open("data.csv", "a") as file:
            file.write(f"{prompt_answer['prompt']};{prompt_answer['answer']};{rating};{comment}\n")

    return jsonify({"message": "Rating submitted successfully"})



if __name__ == "__main__":
    if not deploy:
        app.run(debug=True)
    else:
        app.run(host='0.0.0.0', port=5000, debug=False)