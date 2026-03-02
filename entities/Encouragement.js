export default {
  "name": "Encouragement",
  "type": "object",
  "properties": {
    "from_name": {
      "type": "string"
    },
    "from_email": {
      "type": "string"
    },
    "to_email": {
      "type": "string"
    },
    "message": {
      "type": "string"
    }
  },
  "required": [
    "from_email",
    "to_email",
    "message"
  ]
}