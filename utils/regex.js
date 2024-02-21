exports.noSpaceRegex = /^\S*$/;
exports.numberRegex = /^[0-9]+$/;
exports.floatRegex = /^-?\d+(?:\.\d+)?$/;
exports.passwordRegex = /^(?=\S{8,}$).*/;
exports.phoneNoRegex = /^(\d{3}-\d{3}-\d{4})$/;
exports.positionRegex = /^(Front|Back|Left|Right)$/;
exports.emergencyRegex = /^(pending|inProgress|complete)$/;
exports.reportRegex =
	/^(ACCIDENT|CLOSED ROAD|CONSTRUCTION|TRAFFIC CONGESTION)$/;
