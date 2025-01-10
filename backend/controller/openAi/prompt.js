const { OpenAI } = require('openai')
const httpErrors = require('http-errors')

const openai = new OpenAI({
  apiKey: process.env.CHAT_GPT_KEY
})

module.exports = async (req, res, next) => {
  let { geneName, language = 'English' } = req.body

  if (!geneName) {
    return next(httpErrors(400, 'Gene name is required'))
  }

  try {
    const prompt = `
    Provide exhaustive and in-depth information about the gene "${geneName}" in the following structured JSON format in ${language}.
    For each field, include as much relevant detail as possible, citing hypothetical research findings, examples, and explanations where applicable:
    {
      "geneName": "${geneName}",
      "overview": "Provide a thorough description of the gene, including its exact location (chromosome number and position), structure, role in cellular functions, and historical discoveries associated with it.",
      "diseases_associated": "List all known diseases and disorders linked to this gene, detailing their prevalence, pathophysiology, and any specific populations or demographics affected.",
      "mutations": "Provide comprehensive details on all known mutations, including single nucleotide polymorphisms (SNPs), structural variations, and their impact on gene function. Include examples and classifications (e.g., missense, nonsense, frameshift mutations).",
      "gene_interactions": "Elaborate on all known interactions with other genes or proteins, describing the biological pathways involved, mechanisms of regulation, and their roles in homeostasis or disease.",
      "drug_resistance": "Provide an exhaustive analysis of any drug resistance phenotypes associated with the gene, citing examples from clinical studies and experimental findings.",
      "related_conditions": "Describe all conditions and traits indirectly linked to the gene, highlighting secondary or tertiary effects, genetic predispositions, and environmental interactions.",
      "treatment_strategies": "List detailed treatment strategies for conditions influenced by this gene. Include cutting-edge approaches such as CRISPR, RNA therapies, immunotherapies, and pharmacological interventions.",
      "affected_body_part": "List the body parts or organs affected by diseases associated with this gene. Include only the names of the affected parts, such as lungs, heart, liver, brain, etc."
    }
    If the gene "${geneName}" does not exist or is invalid, respond with the following JSON:
    {
      "error": "No such gene found."
    }
    
    Only return valid JSON. No extra text or explanations.
    `

    // Request to OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 1, // Randomness (1 is more creative)
      max_tokens: 4096, // Maximum number of tokens in the response
      top_p: 1, // Controls diversity (1 means more diverse)
      frequency_penalty: 0, // No penalty for repetition
      presence_penalty: 0 // No penalty for reintroducing concepts
    })

    const gptResponse = response.choices[0].message.content

    let cleanedResponse = gptResponse
      .replace(/#_/g, '') // Remove #_
      .replace(/“|”/g, '"') // Convert smart quotes to regular quotes
      .replace(/,\s*}$/g, '}') // Remove trailing commas before closing braces

    // Parse the response and handle any JSON errors
    const parsedResponse = JSON.parse(cleanedResponse)

    if (parsedResponse.error) {
      return next(httpErrors(404, parsedResponse.error))
    }

    return res.status(200).json(parsedResponse)
  } catch (error) {
    return next(httpErrors(500, error.message))
  }
}
