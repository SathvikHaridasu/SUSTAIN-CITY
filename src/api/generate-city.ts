
const API_KEY = "AIzaSyD-MxIRMlTeAnEHvcbO5qMNYzw9-DuWaRs";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function generateCity(prompt: string) {
  try {
    console.log("Received request to generate city");
    console.log("Prompt:", prompt);

    // Create a more specific prompt for city generation
    const fullPrompt = `
      ${prompt}
      
      Generate a small city layout for a 10x10 grid. Return the layout as a JSON array of objects with the following format:
      [
        { "type": "building_type", "x": x_coordinate, "y": y_coordinate }
      ]
      
      Available building types:
      - residential-house
      - apartment-building
      - green-apartment
      - retail-store
      - office-building
      - park
      - community-garden
      - road
      - solar-panel
      - wind-turbine
      
      Rules:
      1. x and y coordinates must be between 0 and 9
      2. Include a mix of different building types
      3. Create a logical road network
      4. Place parks and green spaces strategically
      5. Include renewable energy sources
      6. Keep the response concise and complete
      7. Return exactly 100 buildings (one for each grid cell)
      
      Return only the JSON array, no other text or markdown formatting.
    `;

    console.log("Sending request to Gemini API");
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Received response from Gemini API:", data);

    const text = data.candidates[0].content.parts[0].text;
    console.log("Extracted text:", text);

    try {
      // Clean up the response text - remove any markdown formatting
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

      // Parse the JSON response
      const layout = JSON.parse(cleanText);

      // Validate the layout
      if (!Array.isArray(layout)) {
        throw new Error("Layout must be an array");
      }

      // Validate each building
      layout.forEach((building, index) => {
        if (
          !building.type ||
          !Number.isInteger(building.x) ||
          !Number.isInteger(building.y)
        ) {
          throw new Error(
            `Invalid building at index ${index}: ${JSON.stringify(building)}`
          );
        }
        if (
          building.x < 0 ||
          building.x > 9 ||
          building.y < 0 ||
          building.y > 9
        ) {
          throw new Error(
            `Building coordinates out of bounds at index ${index}: ${JSON.stringify(
              building
            )}`
          );
        }
      });

      // Validate grid completeness (this is optional and can be removed if not needed)
      const grid = Array(10)
        .fill(null)
        .map(() => Array(10).fill(null));
      layout.forEach((building) => {
        grid[building.y][building.x] = building;
      });

      const emptyCells = grid.flat().filter((cell) => cell === null).length;
      if (emptyCells > 0) {
        console.warn(`Grid is incomplete: ${emptyCells} empty cells`);
      }

      console.log("Successfully parsed and validated layout:", layout);
      return { layout };
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.error("Raw response:", text);
      throw new Error(
        `Failed to parse city layout response: ${parseError.message}`
      );
    }
  } catch (error) {
    console.error("Error generating city:", error);
    throw error;
  }
}
