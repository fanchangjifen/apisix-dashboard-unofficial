.PHONY: all
all: admin control

.PHONY: admin
admin:
	$(MAKE) all -C admin

.PHONY: control
control:
	$(MAKE) all -C control

.PHONY: clean
clean:
	$(MAKE) clean -C admin
	$(MAKE) clean -C control