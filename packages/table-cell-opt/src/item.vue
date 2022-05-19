<template lang="pug">
div 1

</template>
<script>


export default {
    beforeCreate() {
        this.$parent.items.push(this);
    },
    beforeDestroy() {
        const {items} = this.$parent;
        const index = items.indexOf(this);
        if (index >= 0) {
            items.splice(index, 1);
        }
    },
    
}
</script>
