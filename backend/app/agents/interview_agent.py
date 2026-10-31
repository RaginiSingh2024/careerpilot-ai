from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.services.gemini_service import gemini_service

class MockInterviewAgent(BaseAgent):
    name = "Mock Interview Agent"
    description = "Conducts interactive role-specific technical mock interviews and provides transparent rubric-based grading across correctness, clarity, technical depth, and problem-solving."

    def generate_questions(
        self,
        target_role: str = "Backend Software Engineer",
        topic: str = "System Design & APIs",
        num_questions: int = 3
    ) -> List[Dict[str, Any]]:
        task = f"Generate {num_questions} interview questions for '{target_role}' on topic '{topic}'"

        def live_runner(inputs: Any) -> Dict[str, Any]:
            prompt = f"""
You are the Mock Interview Agent in CareerPilot AI.
Generate {num_questions} realistic, challenging interview questions for:
Role: {target_role}
Topic: {topic}

Return a strictly valid JSON object with:
{{
  "questions": [
    {{
      "question": "Clear, direct interview question",
      "category": "{topic}",
      "difficulty": "Medium",
      "rubric": {{
        "correctness": 25,
        "clarity": 25,
        "technical_depth": 25,
        "problem_solving": 25
      }}
    }}
  ]
}}
"""
            res = gemini_service.generate_structured_json(prompt, system_instruction="Generate realistic software engineering interview questions.")
            return res.get("questions", [])

        def fallback_runner(inputs: Any) -> List[Dict[str, Any]]:
            return [
                {
                    "question": "Explain the difference between SQL indexing with B-Trees versus Hash Indexes. When would an index degrade performance instead of improving it?",
                    "category": "Databases & Query Optimization",
                    "difficulty": "Medium",
                    "rubric": {
                        "correctness": 25,
                        "clarity": 25,
                        "technical_depth": 25,
                        "problem_solving": 25
                    }
                },
                {
                    "question": "How would you design an idempotent POST endpoint for financial payment transactions to prevent duplicate charges caused by network timeouts or user double-clicking?",
                    "category": "REST API Architecture & Concurrency",
                    "difficulty": "Medium-Hard",
                    "rubric": {
                        "correctness": 25,
                        "clarity": 25,
                        "technical_depth": 25,
                        "problem_solving": 25
                    }
                },
                {
                    "question": "What is the difference between Docker containerization and virtual machines? How do Linux cgroups and namespaces enable container isolation?",
                    "category": "DevOps & Infrastructure",
                    "difficulty": "Medium",
                    "rubric": {
                        "correctness": 25,
                        "clarity": 25,
                        "technical_depth": 25,
                        "problem_solving": 25
                    }
                }
            ]

        res = self.execute_with_telemetry(task, {"role": target_role, "topic": topic}, live_runner, fallback_runner)
        return res if isinstance(res, list) else res.get("questions", [])

    def evaluate_answer(self, question: str, user_answer: str, rubric: Dict[str, Any] = None) -> Dict[str, Any]:
        task = f"Evaluate interview answer for question: '{question[:60]}...'"

        def live_runner(inputs: Any) -> Dict[str, Any]:
            prompt = f"""
You are the Mock Interview Agent in CareerPilot AI.
Evaluate this candidate's technical interview answer objectively.

Question:
{question}

Candidate's Answer:
{user_answer}

Rubric criteria (Total 100 points):
- correctness (0 - 25 points): Technical accuracy of facts, mechanisms, and trade-offs.
- clarity (0 - 25 points): Structure, communication clarity, concise articulation.
- technical_depth (0 - 25 points): Concrete terminology, internal mechanisms, edge cases mentioned.
- problem_solving (0 - 25 points): Practical engineering reasoning, real-world trade-offs acknowledged.

Return a strictly valid JSON object:
{{
  "correctness_score": 22.0,
  "clarity_score": 20.0,
  "technical_depth_score": 18.0,
  "problem_solving_score": 21.0,
  "total_score": 81.0,
  "feedback": "Comprehensive, constructive paragraph summarizing overall quality and advice.",
  "strengths": [
    "Specific point done well",
    "Another strong technical insight"
  ],
  "gaps": [
    "Specific detail or edge case that was omitted or under-explained"
  ],
  "suggested_improved_answer": "Model answer demonstrating ideal senior-level structure and precision."
}}
"""
            return gemini_service.generate_structured_json(prompt, system_instruction="Evaluate technical interview answers with rigorous, supportive grading.")

        def fallback_runner(inputs: Any) -> Dict[str, Any]:
            word_count = len(user_answer.strip().split())
            
            # Deterministic, intelligent heuristic evaluation when offline:
            # Check length & keyword density
            has_keywords = any(kw in user_answer.lower() for kw in ["index", "btree", "key", "idempotency", "token", "docker", "cgroup", "namespace", "kernel", "table", "write", "performance", "cache", "transaction"])
            
            if word_count < 15:
                corr = 12.0
                clar = 14.0
                depth = 10.0
                ps = 10.0
                tot = 46.0
                fb = "Your answer is quite brief. While it touches upon the basic idea, technical interviewers look for structured explanations with concrete mechanisms and trade-offs."
                gaps = ["Insufficient technical elaboration", "Omitted key trade-offs and real-world failure modes"]
            else:
                corr = 21.5 if has_keywords else 18.0
                clar = 22.0
                depth = 20.5 if has_keywords else 17.0
                ps = 21.0
                tot = corr + clar + depth + ps
                fb = "Strong and clear explanation! You demonstrated a good conceptual grasp of the core mechanism and structured your thoughts logically."
                gaps = ["Could dive deeper into specific edge cases or memory overhead implications under extreme load."]

            return {
                "correctness_score": corr,
                "clarity_score": clar,
                "technical_depth_score": depth,
                "problem_solving_score": ps,
                "total_score": tot,
                "feedback": fb,
                "strengths": [
                    "Communicated the primary concept with solid logical flow.",
                    "Demonstrated awareness of real-world backend engineering implications."
                ],
                "gaps": gaps,
                "suggested_improved_answer": (
                    "To answer this comprehensively in an interview:\n"
                    "1. Define the core mechanism clearly: 'B-Trees support range scans and inequality comparisons (O(log N)), whereas Hash indexes provide O(1) exact equality lookups but cannot support range queries.'\n"
                    "2. Explain trade-offs: 'Every index incurs write amplification on INSERT, UPDATE, and DELETE operations because the index tree must be rebalanced, and consumes RAM/disk space.'\n"
                    "3. Cite failure modes: 'Indexes degrade performance on low-cardinality columns (e.g., Boolean flags) where query optimizers prefer sequential scans, or in write-heavy logging tables where write overhead dominates query gains.'"
                )
            }

        return self.execute_with_telemetry(task, {"question": question, "answer": user_answer}, live_runner, fallback_runner)

