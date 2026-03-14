const https = require('https');

const callClaude = (systemPrompt, userMessage) => new Promise((resolve, reject) => {
  const body = JSON.stringify({
    model: 'claude-sonnet-4-5',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }]
  });
  const options = {
    hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Length': Buffer.byteLength(body) }
  };
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
  });
  req.on('error', reject);
  req.write(body);
  req.end();
});

exports.generateProposal = async (req, res, next) => {
  try {
    const { jobTitle, jobDescription, skills, freelancerBio, freelancerSkills } = req.body;
    const system = `You are an expert freelance proposal writer. Write compelling, personalised, winning proposals for Indian freelancers. Be specific, professional, and conversion-focused. Keep proposals under 300 words.`;
    const prompt = `Write a proposal for this job:
Title: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${skills?.join(', ')}

Freelancer Profile:
Bio: ${freelancerBio || 'Experienced professional'}
Skills: ${freelancerSkills?.join(', ')}

Write a compelling cover letter that highlights relevant experience, proposes a clear approach, and ends with a strong call to action.`;

    const response = await callClaude(system, prompt);
    const text = response.content?.[0]?.text || '';
    res.json({ success: true, data: { proposal: text } });
  } catch (err) { next(err); }
};

exports.generateJobPost = async (req, res, next) => {
  try {
    const { projectSummary, budget, skills } = req.body;
    const system = `You are an expert at writing clear, detailed freelance job posts that attract top talent. Write for the Indian market.`;
    const prompt = `Create a detailed job post for:
Summary: ${projectSummary}
Budget: ${budget}
Skills needed: ${skills?.join(', ')}

Include: clear title, detailed description, deliverables, timeline suggestions, and screening questions.`;

    const response = await callClaude(system, prompt);
    res.json({ success: true, data: { jobPost: response.content?.[0]?.text || '' } });
  } catch (err) { next(err); }
};

exports.getRateAdvice = async (req, res, next) => {
  try {
    const { skills, experience, projectType } = req.body;
    const system = `You are a freelance career advisor specialising in the Indian freelance market. Give specific, data-driven rate recommendations in INR.`;
    const prompt = `What rate should I charge for:
Skills: ${skills?.join(', ')}
Experience: ${experience}
Project Type: ${projectType}

Give hourly rate and project rate ranges with reasoning, and tips to command higher rates.`;

    const response = await callClaude(system, prompt);
    res.json({ success: true, data: { advice: response.content?.[0]?.text || '' } });
  } catch (err) { next(err); }
};

exports.chatWithAssistant = async (req, res, next) => {
  try {
    const { messages, userRole, userName } = req.body;
    const system = `You are Claude, an expert AI assistant embedded in FreelanceHub — India's leading MERN stack freelancing platform. The user is a ${userRole} named ${userName}.

Help with:
${userRole === 'freelancer'
  ? '- Writing winning proposals\n- Setting competitive rates (INR)\n- Improving Job Success Score\n- Profile optimisation\n- Client communication\n- Career growth advice'
  : '- Writing clear job posts\n- Setting realistic budgets\n- Evaluating freelancer proposals\n- Interview questions\n- Contract advice\n- Project scoping'}

Be conversational, practical, and India-market aware.`;

    const response = await callClaude(system, messages[messages.length - 1]?.content || '');
    res.json({ success: true, data: { reply: response.content?.[0]?.text || '' } });
  } catch (err) { next(err); }
};

exports.analyseProposal = async (req, res, next) => {
  try {
    const { proposal, jobDescription } = req.body;
    const system = `You are a freelance hiring expert. Analyse proposals critically and give actionable improvement feedback.`;
    const prompt = `Analyse this proposal for the job:

Job: ${jobDescription}

Proposal: ${proposal}

Rate it 1-10 and give specific improvements.`;

    const response = await callClaude(system, prompt);
    res.json({ success: true, data: { analysis: response.content?.[0]?.text || '' } });
  } catch (err) { next(err); }
};
