# Use official Node.js LTS (Long Term Support) image as base
FROM node:20.6.1-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Install necessary packages (curl and others)
RUN apk add --no-cache bash curl ca-certificates python3 py3-pip


# Install Python dependencies
RUN pip install pyyaml \
    && pip install torch torchvision -f https://download.pytorch.org/whl/torch_stable.html \
    && python -m pip install git+https://github.com/facebookresearch/detectron2.git

# Copy the rest of the application code
COPY . .

# Expose ports 5000 (Express) and 3426 (socket.io)
EXPOSE 5000 3426

# Command to run the application
CMD ["npm", "start"]
