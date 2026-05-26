const detectFraud = (submission) => {
  let fraudScore = 0;
  const reasons = [];

  if (!submission.screenshot) {
    fraudScore += 30;
    reasons.push('No screenshot provided');
  }

  if (submission.screenshot && submission.screenshot.length < 100) {
    fraudScore += 20;
    reasons.push('Suspicious screenshot URL length');
  }

  if (submission.proofUrl) {
    const suspiciousPatterns = [
      /bit\.ly/i,
      /tinyurl/i,
      /shorte\.st/i,
      /shorturl/i,
    ];
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(submission.proofUrl)) {
        fraudScore += 15;
        reasons.push('Suspicious URL shortener detected');
        break;
      }
    }
  }

  const now = new Date();
  const submissionHour = now.getHours();
  if (submissionHour >= 1 && submissionHour <= 5) {
    fraudScore += 10;
    reasons.push('Suspicious submission time (1AM-5AM)');
  }

  if (fraudScore >= 30) {
    return { isFraud: true, fraudScore, reasons };
  }

  return { isFraud: false, fraudScore, reasons };
};

module.exports = { detectFraud };
