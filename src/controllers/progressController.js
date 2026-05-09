function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    solvedProblems: user.solvedProblems || [],
    createdAt: user.createdAt,
  };
}

async function completeProblem(req, res, next) {
  try {
    const problemId = Number(req.params.problemId);

    if (!Number.isInteger(problemId) || problemId <= 0) {
      res.status(400);
      throw new Error("Problem id must be a positive integer.");
    }

    if (!req.user.solvedProblems.includes(problemId)) {
      req.user.solvedProblems.push(problemId);
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: "Problem marked as completed.",
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  completeProblem,
};
