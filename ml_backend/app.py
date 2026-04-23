from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

# Ignore the TensorFlow terminal warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app) # This allows your React app to talk to this Python app safely

print("Loading AI Brain... Please wait.")
# Change this line
model = tf.keras.models.load_model('dosha_model.keras')
class_names = ['Balanced', 'Kapha', 'Pitta', 'Vata']
print("✅ AI Ready to accept images!")

@app.route('/predict', methods=['POST'])
def predict_dosha():
    # 1. Check if an image was actually sent
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    file = request.files['file']
    
    try:
        # 2. Open the image and shrink it to 224x224 (what the AI expects)
        image = Image.open(io.BytesIO(file.read())).convert('RGB')
        image = image.resize((224, 224))
        
        # 3. Translate the image into numbers for TensorFlow
        img_array = tf.keras.utils.img_to_array(image)
        img_array = tf.expand_dims(img_array, 0) # Create a "batch" of 1 image
        
        
        # 4. Ask the AI to predict!
        predictions = model.predict(img_array)
        
        # 5. Find the highest score
        winning_index = np.argmax(predictions[0])
        winning_class = class_names[winning_index]
        confidence_score = float(predictions[0][winning_index])
        
        # 6. Send the answer back to React
        return jsonify({
            'dosha': winning_class,
            'confidence': round(confidence_score * 100, 2) # Turn 0.85 into 85.0%
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run the server on Port 5001 (so it doesn't fight with your Node backend on 5000)
if __name__ == '__main__':
    app.run(port=5001, debug=True)