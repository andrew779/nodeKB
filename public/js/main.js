$(document).ready(function(){
    $('.delete-article').on('click', function(event){
        $target = $(event.target);
        const id = $target.attr('data-id');
        $.ajax({
            type: 'DELETE',
            url: '/articles/'+id,
            success: function(response){
                alert('Deleting Article');
                window.location.href='/';
            },
            error: function(error){
                console.log(error);
            }
        });
    });
});