class NoLessonAssessmentError(Exception):
    pass

class NoCourseAssessmentError(Exception):
    pass

class NoTestAssessmentError(Exception):
    pass

class NoTestSessionError(Exception):
    pass

class NoAssessmentError(Exception):
    pass

class NoAssessmentSessionError(Exception):
    pass

class NoTestBlueprintError(Exception):
    pass

class TestSessionExpiredError(Exception):
    pass

class NoQuestionError(Exception):
    pass

class TestSessionMarkingError(Exception):
    pass

class NoCorrectOptionError(Exception):
    pass

class InvalidQuestionType(Exception):
    pass