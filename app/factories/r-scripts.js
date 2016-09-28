'use strict';

angular.module('app')
	.factory('RScripts', function(){
		var RScripts = {};

		RScripts.getIterationCandidates = function() {
			return `library("irace")

args <- commandArgs(trailingOnly = TRUE)

irace.file <- "irace.Rdata"
filename <- "iterationConfigurations.txt"
if(length(args)>0){
##LOTS of validation to make in general
for(i in 1:length(args)){
  if(args[i] == "--irace.file")
    irace.file <- args[i+1]
  if(args[i] == "--filename")
    filename=args[i+1]
  if(args[i] == "--help"){
    cat("example:\\n./script --irace.file irace.Rdata --filename candidates.txt\\n",
        "Values shown here are default.\\n")
    q()
  
  }
}
}

configurations <- getFinalElites(irace.logFile=irace.file, n=10, drop.internals=TRUE) 
configurations <- data.frame(lapply(configurations, unlist), stringsAsFactors=FALSE)

# Print them
print(configurations)

# or Put them in a file
write.table(x=as.data.frame(configurations), file=filename, row.names=FALSE, quote=FALSE)


`;
		};

		RScripts.getTestByIteration = function() {
			return `library("irace")
irace.file <- "irace.Rdata"

args <- commandArgs(trailingOnly = TRUE)

irace.file <- "irace.Rdata"
filename <- "iteration-results.txt"
if(length(args)>0){
  for(i in 1:length(args)){
    if(args[i] == "--irace.file")
      irace.file <- args[i+1]
    if(args[i] == "--filename")
      filename=args[i+1]
    if(args[i] == "--help"){
      cat("example:\\n./script --irace.file irace.Rdata \\n",
          "Values shown here are default.\\n")
      q()
    }
  }
}

load(irace.file)


ids <- iraceResults$iterationElites
tests <- iraceResults$testing$experiments[,as.character(ids)]

#OUTPUT THE TEST
print(tests)
# OR PRINT IT
write.table(tests, file=filename, quote=FALSE)



`;
		};

		RScripts.getTestElites = function() {
			return `library("irace")
irace.file <- "irace.Rdata"

args <- commandArgs(trailingOnly = TRUE)

irace.file <- "irace.Rdata"
filename <- "best-tests.txt"
#ninitial <- 0

if(length(args)>0){
  for(i in 1:length(args)){
    if(args[i] == "--irace.file")
      irace.file <- args[i+1]
    if(args[i] == "--filename")
      filename=args[i+1]
 #   if(args[i] == "--ninitial")
 #     ninitial=args[i+1]
    if(args[i] == "--help"){
      cat("example:\\n./script --irace.file irace.Rdata --filename best-tests.txt \\n",
          "Values shown here are default.\\n")
      q()
    }
  }
}

load(irace.file)

ids <- iraceResults$allElites[[length(iraceResults$iterationElites)]]
tests <- iraceResults$testing$experiments[,as.character(ids)]

#OUTPUT THE TEST
print(tests)
# OR PRINT IT
write.table(tests, file=filename, quote=FALSE)

`;
		};

		RScripts.getIraceInfo = function() {
			return `irace.file <- "irace.Rdata" 

args <- commandArgs(trailingOnly = TRUE)

irace.file <- "irace.Rdata"

if(length(args)>0){
  for(i in 1:length(args)){
    if(args[i] == "--irace.file")
      irace.file <- args[i+1]
      filename=args[i+1]
    if(args[i] == "--help"){
      cat("example:\\n./script --irace.file irace.Rdata \\n",
          "Values shown here are default.\\n")
      q()
    }
  }
}

load(irace.file)

iterations <- length(iraceResults$iterationElites)
ncand <- nrow(iraceResults$allConfigurations)
felites <- length(iraceResults$allElites[[length(iraceResults$iterationElites)]])

cat("iterations: ",iterations, "\\n")
cat("configurations:", ncand,"\\n")
cat("Number of final elites:", felites, "\\n")

`;
		};

		RScripts.getEliteCandidates = function() {
			return `library("irace")

args <- commandArgs(trailingOnly = TRUE)

irace.file <- "irace.Rdata"
filename <- "bestConfigurations.txt"
if(length(args)>0){
##LOTS of validation to make in general
for(i in 1:length(args)){
  if(args[i] == "--irace.file")
    irace.file <- args[i+1]
  if(args[i] == "--filename")
    filename=args[i+1]
  if(args[i] == "--help"){
    cat("example:\\n./script --irace.file irace.Rdata --filename candidates.txt\n",
        "Values shown here are default.\\n")
    q()
  
  }
}
}

configurations <- getFinalElites(irace.logFile=irace.file, n=10, drop.internals=TRUE) 
configurations <- data.frame(lapply(configurations, unlist), stringsAsFactors=FALSE)

# Print them
print(configurations)

# or Put them in a file
write.table(x=as.data.frame(configurations), file=filename, row.names=FALSE, quote=FALSE)


`;
		};

		RScripts.getExplore = function() {
			return `	
		
## Function definition

printUsage <- function(){

	cat("\\nParameters exploration script:\\n   Rcript explore.R --parameter-file parameters.txt --configurations-file candidates.txt --sel-param-file selection.txt --log-file log.Rdata --target-runner targer-runner --type [ablation|full]\\n",
		"\\n\\n  ** This scripts uses irace functions, therefore irace must installed.\\n  ** Parameter file and candidate file must be in the irace format.\\n")
}

readArguments <- function(args){
	#print(args)
  #Read arguments
	control <- list()
	control[["logFile"]] <- "test-results.txt"
	control[["parallel"]] <- 1
	control[["type"]] <- "full"
	control[["--selParametersFile"]] <- NULL
	continue.parse <- TRUE
	i<- 1
	while(continue.parse){
		if(args[i]=="--parameter-file"){
			control[["parameterFile"]] <- as.character(args[i+1])
		}else if(args[i]=="--sel-param-file"){
			control[["--selParametersFile"]] <- as.character(args[i+1])
		}else if(args[i]=="--configurations-file"){
			control[["configurationsFile"]] <- as.character(args[i+1])
		}else if(args[i]=="--log-file"){
			control[["logFile"]] <- as.character(args[i+1])
		}else if(args[i]=="--instance-file"){
			control[["instanceFile"]] <- as.character(args[i+1])
		}else if(args[i]=="--type"){
			control[["type"]] <- as.character(args[i+1])
		}else if(args[i]=="--target-runner"){
			control[["targetRunner"]] <- as.character(args[i+1])
		}else if(args[i]=="--parallel"){
			control[["parallel"]] <- as.numeric(args[i+1])
		}else if(args[i]=="--type"){
			control[["type"]] <- as.character(args[i+1])
		}else if(args[i]=="--help"){
			printUsage()
			stop("--help command")
		}else{
			errr <- paste("#ERROR: Unknown parameter", args[i],"\\n")
			printUsage()
			stop(errr)
		}
		i <- i+2
		if(length(args)< i) continue.parse <- FALSE
	}
	if(is.null(control[["parameterFile"]]) || is.null(control[["configurationsFile"]]) || is.null(control[["instanceFile"]]) || is.null(control[["targetRunner"]])){
		printUsage()
		stop("Arguments --parameter-file, --configurations-file, --instance-file, --target-runner are mandatory.\\n")
	}
	if(!(control[["type"]] %in% c("full", "ablation"))){
		printUsage()
		stop("Argument --type not valid.\\n")
	}

	return(control)
}

conditionsSatisfied <- function (parameters, partialConfiguration, paramName){
	condition <- parameters[["conditions"]][[paramName]]
  # If there is no condition, do not waste time evaluating it.
	if (!length(all.vars(condition, max.names = 1L))) return(TRUE)

	v <- eval(condition, as.list(partialConfiguration))
  # Return TRUE if TRUE, FALSE if FALSE or NA
	v <- !is.na(v) && v
	return(v)
}

getRandomParamValue <- function(param.name, parameters, digits=2){
	ptype <- parameters[["types"]][param.name]
	if(ptype %in% c("c", "o")){
		value <- sample(parameters[["domain"]][[param.name]], size=1)
	}else if(ptype %in% c("i", "r")){
		b1 <- parameters[["domain"]][[param.name]][1]
		b2 <- parameters[["domain"]][[param.name]][2]
		value <- round(runif(1, min=b1, max=b2), digits=digits)
	}else{
		stop("ERROR when assigning new values.\\n")
		value <- NA
	}
	return(value)
}


fixDependencies <- function(candidate, ref.candidate=NULL, parameters, digits=2){
# Search parameters that need a value
	extra.changed <- c()
	for(pname in parameters[["names"]]){
		if(parameters[["isFixed"]][pname]) next
		if(conditionsSatisfied(parameters, candidate, pname) && is.na(candidate[,pname])){
			if(!is.null(ref.candidate)){
				candidate[,pname] <- ref.candidate[pname]
			}else{
				candidate[,pname] <- getRandomParamValue(pname, parameters, digits=digits)
			}
			extra.changed <- c(extra.changed, pname)
			aux <- fixDependencies(candidate=candidate, ref.candidate=ref.candidate, parameters=parameters, digits=digits)
			extra.changed <- c(extra.changed, aux[["changed"]])
			candidate <- aux[["candidate"]]
		}
	}
	rr <- list(candidate=candidate, changed=extra.changed)
	return(rr)
}

generateNeighborsAblation <- function(initial.candidate, final.candidate, parameters, param.names){
	candidates <- NULL
	changed.params <- list()
	for (pname in param.names){
		if (parameters[["isFixed"]][pname]) next
    # Check if parameter is active
		if (conditionsSatisfied(parameters,initial.candidate, pname)){
		# check they are different
			if (initial.candidate[,pname]!=final.candidate[,pname]){
				new.candidate <- initial.candidate
				new.candidate[,pname]<- final.candidate[,pname]

				aux <- fixDependencies(new.candidate, final.candidate, parameters)

				new.candidate <- aux[["candidate"]]
				changed.params[[length(changed.params)+1]] <- c(pname, aux[["changed"]])

				if(is.null(candidates)) candidates <- new.candidate
				else candidates <- rbind(candidates, new.candidate)
			}
		}
	}
	rr <- list(candidates=candidates, changed.params=changed.params)
	return(rr)
}

generateNeighborsExploration <- function(candidate, parameters, param.names, nintervals=5, digits=2){
	candidates <- candidate
	changed.params <- list()
	for(pname in param.names){
	#cat(pname,"\\n")
		if(parameters[["isFixed"]][pname]) next
		ptype <- parameters[["types"]][pname]
    # Check if parameter is active
		if(conditionsSatisfied(parameters, candidate, pname)){
			if(ptype %in% c("c", "o")){
				values <- parameters[["domain"]][[pname]]
			}else{
				b1 <- parameters[["domain"]][[pname]][1]
				b2 <- parameters[["domain"]][[pname]][2]
				intervals <-seq(b1,b2, by=((b2-b1)/(nintervals+1)))
				values <- c()
				for(i in 1:nintervals)
				values <- c(values, runif(1, min=intervals[i], max=intervals[i+1]))
				values <- round(values, digits=digits)
			}

			for(value in values){
				new.candidate <- candidate
				if(value!=new.candidate[,pname]){
					new.candidate[,pname] <- value
					aux <- fixDependencies(new.candidate, NULL, parameters, digits)
					new.candidate <- aux[["candidate"]]
					changed.params[[length(changed.params)+1]] <- c(pname, aux[["changed"]])
					candidates <- rbind(candidates, new.candidate)
				}
			}
		}
	}
	rr <- list(candidates=candidates, changed.params=changed.params)
	return(rr)
}

createExperimentList <- function(candidates, parameters, instances){
	experiments <- list()
	pnames <- unlist(parameters[["names"]])
	switches <- unlist(parameters[["switches"]][pnames])
	count <- 1
	for(i in 1:nrow(candidates)){
		for(j in 1:length(instances$instances)){
			experiments[[count]] <- list (id.configuration = i,
				id.instance  = j,
				seed = instances[["seed"]][j],
				configuration = candidates[i,pnames],
				instance = instances[["instances"]][j],
				extra.params = instances[["extra.params"]],
				switches = switches)
			count <- count + 1
		}
	}
	return(experiments)
}

hook.run.default <- function(experiment, hook.run) {
	configuration.id <- experiment[["id.configuration"]]
	instance.id      <- experiment[["id.instance"]]
	seed             <- experiment[["seed"]]
	configuration    <- experiment[["configuration"]]
	instance         <- experiment[["instance"]]
	extra.params     <- experiment[["extra.params"]]
	switches         <- experiment[["switches"]]

	runcommand <- function(command, args) {
		#cat(paste(command, args),"\\n")
		err <- NULL
		output <-  withCallingHandlers(
			tryCatch(system2(command, args, stdout = TRUE, stderr = TRUE),
				error=function(e) {
					err <<- c(err, paste(conditionMessage(e), collapse="\\n"))
					NULL
				}), warning=function(w) {
				err <<- c(err, paste(conditionMessage(w), collapse="\\n"))
				invokeRestart("muffleWarning")
			})
    # If e is a warning, the command failed.
		if (!is.null(err)) {
			err <- paste(err, collapse ="\\n")
			return(list(output = output, error = err))
		}
		return(list(output = output, error = NULL))
	}

	parse.output <- function(outputRaw, command){
		output <- NULL
    # strsplit crashes if outputRaw == character(0)
			if (length(outputRaw) > 0) {
				output <- strsplit(irace:::trim(outputRaw), "[[:space:]]+")[[1]]
      # suppressWarnings to avoid messages about NAs introduced by coercion
				output <- suppressWarnings (as.numeric (output))
			}

    # We check the output here to provide better error messages.
		if (length(output) < 1 || length(output) > 2 || any (is.na (output)) || any (!is.numeric(output))) {
			cat("The output of '", command, "' is not numeric!", sep = "")
			return(NULL)
		} else if (any(is.infinite(output))) {
			cat("The output of '", command, "' is not finite!", sep = "")
			return(NULL)
		}
		return(output)
	}

	if (as.logical(file.access(hook.run, mode = 1))) {
		cat ("target.runner '", hook.run, "' cannot be found or is not executable!\\n")
		return(NULL)
	}

	args <- paste(configuration.id, instance.id, seed, instance, extra.params,
		buildCommandLine(configuration, switches))
	output <- runcommand(hook.run, args)

	if (!is.null(output[["error"]])) {
		cat(output[["error"]], "\\nThe call to targetRunner was:\\n", hook.run, " ", args, "\\n",
			"The output was:\\n", paste(output[["output"]], collapse = "\\n"),
			"\\n")
	}

  # Parse output
	p.output <- parse.output(output[["output"]], paste(hook.run, args))

  # targetEvaluator is NULL, so parse the output just here.
	return(p.output)
}

executeExperiments<- function(experiments, hook.run, parallel){
	output <- NULL
	if(parallel>1){
		output <- parallel::mclapply(experiments, hook.run.default,
                             # FALSE means load-balancing.
			mc.preschedule = FALSE,
			mc.cores = parallel,
			hook.run = hook.run)

	}else{
		output <- list()
		for(i in seq_along(experiments)){
			output[[i]] <- hook.run.default(experiments[[i]], hook.run)
		}
	}
	return(unlist(output))

}

getBestExperiment <- function(experiments, results, neighborhood, instances, parameters){

	candidates     <- neighborhood[["candidates"]]
	changed.params <- neighborhood[["changed.params"]]
	res.matrix     <- matrix(NA, ncol=nrow(candidates), nrow=length(instances$instances))
	count          <- 1

	for(i in 1:nrow(candidates)){
		for(j in 1:length(instances$instances)){
			res.matrix[j,i] <- results[count]
			count <- count + 1
		}
	}
  #print(res.matrix)
	cand.mean      <- colMeans(res.matrix)
	best.ids       <- which(cand.mean == min(cand.mean))
  #cat(cand.mean,"\\n")
  #cat("Best:",best.ids,"\\n")
	best.candidate <- candidates[best.ids[1],,drop=FALSE]
  #print(best.candidate)
	best.change    <- changed.params[[best.ids[1]]]
  #print(best.change)

	final <- list(change=best.change, candidate=best.candidate, best.id=best.ids[1], experiments=res.matrix, result=cand.mean[best.ids[1]])
	return(final)

}

doAblation <- function(initial.candidate, final.candidate, instances, parameters, control, param.names=NULL){
	if(is.null(param.names))
		param.names <- unlist(parameters[["names"]])
	best.candidate <- initial.candidate

  #Initial log
	ablation.log <- list(candidates=initial.candidate,
		instances=instances,
		experiments=matrix(NA, ncol=1, nrow=length(instances$instances)),
		control=control,
		trajectory=c(1))

  #Execute initial experiments
	experiments <- createExperimentList(initial.candidate, parameters, instances)
	results     <- executeExperiments(experiments, control[["targetRunner"]], control[["parallel"]])
	for(j in 1:length(instances$instances))
	ablation.log[["experiments"]][j,1] <- results[j]



  #Start ablation file log
	pline <- paste("Initial", mean(ablation.log[["experiments"]][,1]))
	write(pline, file=control[["logFile"]], append=FALSE)

  #Start ablation
	while(length(param.names)>0){
	#Generate neighbors
		neighborhood <- generateNeighborsAblation(best.candidate, final.candidate, parameters, param.names)
		neighbors    <- neighborhood[["candidates"]]
		if(is.null(neighbors)){
			cat("# Stopping no change possible.\\n")
			break
		}
    #Execute experiments
		experiments <- createExperimentList(neighbors, parameters, instances)
		results     <- executeExperiments(experiments, control[["targetRunner"]], control[["parallel"]])
		best        <- getBestExperiment(experiments, results, neighborhood, instances, parameters)

    #Update log
		ablation.log[["experiments"]] <- cbind(ablation.log[["experiments"]], best[["experiments"]])
		ablation.log[["trajectory"]] <- c(ablation.log[["trajectory"]], nrow(ablation.log[["candidates"]]) + best[["best.id"]])
		ablation.log[["candidates"]] <- rbind(ablation.log[["candidates"]], neighbors)

    #Update file log
		change <- best[["change"]]
		pline <- c()
		cat("Best candidate\\n")
		for(i in 1:length(change)){
			pline <- c(pline , paste(change[i],"=", best[["candidate"]][,change[i]],sep=""))
			cat("  ",change[i],best.candidate[,change[i]],"->",best[["candidate"]][,change[i]], "\\n")
		}

		pline <- paste(paste(pline, collapse=","), best[["result"]], sep=" ")
		write(pline, file=control[["logFile"]], append=TRUE)

		best.candidate <- best[["candidate"]]
		param.names <- param.names[!(param.names %in% change)]

	}

}

doExploration <- function(candidate, instances, parameters, control, param.names=NULL){
	if(is.null(param.names))
		param.names <- unlist(parameters[["names"]])
	aux <- generateNeighborsExploration(candidate, parameters, param.names)
	candidates <- aux[["candidates"]]
	changes    <- aux[["changed.params"]]
  #print(changes)
  #print(aux[["candidates"]])

  #Initial log
	explore.log <- list(candidates=candidates,
		instances=instances,
		experiments=matrix(NA, ncol=nrow(candidates), nrow=length(instances$instances)),
		control=control)

	experiments <- createExperimentList(candidates, parameters, instances)
	results     <- executeExperiments(experiments, control[["targetRunner"]], control[["parallel"]])

	cand.means <- c()

	count       <- 0
	for(i in 1:nrow(candidates)){
		pline    <- c()
		for(j in 1:length(instances$instances)){
			count <- count +1
			explore.log[["experiments"]][j,i] <- results[count]
		}
		cand.means <- c(cand.means, mean(explore.log[["experiments"]][,i]))
		if(i ==1){
			write(paste("Initial", cand.means[i]), file=control[["logFile"]], append=FALSE)
			cat("Initial",cand.means[i], "\\n")
			next
		}

		for(change in changes[[i-1]])
			pline <- c(pline , paste(change,"=", candidates[i,change],sep=""))

		write(paste(paste(pline, sep=","), cand.means[i]), file=control[["logFile"]], append=TRUE)
		cat(paste(paste(pline, collapse=","), cand.means[i]), "\\n")
	}

  #print(explore.log[["experiments"]])

}

## End function definition

args <- commandArgs(trailingOnly = TRUE)
library("irace")
options(width=200)

control <- readArguments(args)

parameters <- readParameters(file=control[["parameterFile"]])
candidates <- irace:::readConfigurationsFile(file=control[["configurationsFile"]], parameters=parameters)
instances  <- irace:::readInstances(instancesDir = "", instancesFile = control[["instanceFile"]])
instances[["seed"]] <- sample.int(2147483647, size = length(instances$instances), replace = TRUE)

param.names <- NULL
if(!is.null(control[["--selParametersFile"]]))
	param.names <- read.table(control[["--selParametersFile"]])$V1

print(candidates)

if(control[["type"]]=="ablation"){
	cat("### EXECUTING ABLATION\\n")
	if(nrow(candidates)<2)
		stop("You must suppy at two candidates to perform ablation.\\n")

	log <- doAblation(candidates[1,], candidates[2,], instances, parameters, control, param.names)
}else{
	cat("### EXECUTING FULL EXPLORATION\\n")
	if(nrow(candidates)>1)
		cat("WARNING: More than one candidate provided, using the first one.\\n")
	log <- doExploration(candidates[1,], instances, parameters, control, param.names)
}

`; };

		return RScripts;
	});
