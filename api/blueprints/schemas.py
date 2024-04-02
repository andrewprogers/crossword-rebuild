grid = {
    "type": "array",
    "items": {
        "type": "array",
        "items": {"type": "string"}
    }
}

puzzle_title = {'type': 'string', "minLength": 1, "maxLength": 50}

string_array = {
    "type": "array",
    "items": {"type": "string"}
}

num_array = {
    "type": "array",
    "items": {"type": "integer"}
}

def across_down_schema(content):
    return {
    "type": "object",
    "properties": {
        "across": content,
        "down": content
    },
    "required": ["across", "down"]
}

clues = across_down_schema(string_array)
clue_nums = across_down_schema(num_array)
clue_answers = across_down_schema(string_array)